import 'dart:async';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/local_database_service.dart';
import '../services/network_connectivity_service.dart';
import 'conflict_resolver.dart';
import 'sync_mutation.dart';
import 'sync_queue.dart';

enum SyncStatus {
  idle,
  syncing,
  synced,
  pending,
  failed,
}

class SyncEngine extends GetxService with WidgetsBindingObserver {
  static SyncEngine get to => Get.find<SyncEngine>();

  final LocalDatabaseService localDb = LocalDatabaseService();
  final SyncQueue queue = SyncQueue();
  final NetworkConnectivityService connectivity = NetworkConnectivityService.to;

  final Rx<SyncStatus> syncStatus = SyncStatus.idle.obs;
  final RxInt pendingMutationsCount = 0.obs;
  final Rx<DateTime?> lastSuccessfulSync = Rx<DateTime?>(null);
  final RxString lastSyncError = ''.obs;

  bool _isSyncRunning = false;
  Timer? _debounceTimer;

  final Dio _surveillanceDio = Dio(BaseOptions(
    baseUrl: 'http://10.0.2.2:5000/api',
    connectTimeout: const Duration(seconds: 8),
    receiveTimeout: const Duration(seconds: 8),
  ));

  Future<SyncEngine> init() async {
    WidgetsBinding.instance.addObserver(this);

    // Read last sync timestamp from metadata box
    lastSuccessfulSync.value = localDb.getLastSyncTime('global');
    pendingMutationsCount.value = queue.pendingCount;

    // Listen to queue changes to reactively update pending counter
    queue.watch().listen((_) {
      pendingMutationsCount.value = queue.pendingCount;
      if (pendingMutationsCount.value > 0 && syncStatus.value != SyncStatus.syncing) {
        syncStatus.value = SyncStatus.pending;
      } else if (pendingMutationsCount.value == 0 && syncStatus.value == SyncStatus.pending) {
        syncStatus.value = SyncStatus.synced;
      }
    });

    // Automatically trigger sync when connectivity is restored
    connectivity.addOnRestoredListener(() {
      Get.log('[SYNC] Network restored - triggering auto-sync.');
      syncAll();
    });

    // Initial startup sync quietly in the background after local DB is loaded
    Future.delayed(const Duration(milliseconds: 600), () {
      syncAll();
    });

    return this;
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      Get.log('[SYNC] App resumed from background. Triggering sync.');
      syncAll();
    }
  }

  /// Trigger debounced sync after a local mutation has been recorded
  void notifyMutationAdded() {
    pendingMutationsCount.value = queue.pendingCount;
    syncStatus.value = SyncStatus.pending;

    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 800), () {
      if (connectivity.isOnline.value) {
        syncAll();
      }
    });
  }

  /// Full bi-directional synchronization (Push pending mutations first, then Pull remote changes)
  Future<void> syncAll({bool force = false}) async {
    if (_isSyncRunning) {
      Get.log('[SYNC] Sync already in progress, skipping trigger.');
      return;
    }

    final isReachable = await connectivity.checkReachability();
    if (!isReachable && !force) {
      Get.log('[SYNC] Network is unreachable. Sync deferred.');
      pendingMutationsCount.value = queue.pendingCount;
      if (pendingMutationsCount.value > 0) {
        syncStatus.value = SyncStatus.pending;
      }
      return;
    }

    _isSyncRunning = true;
    syncStatus.value = SyncStatus.syncing;
    lastSyncError.value = '';

    try {
      Get.log('[SYNC] Beginning synchronization cycle...');

      // 1. PUSH: Process pending offline mutations
      await _pushPendingMutations();

      // 2. PULL: Fetch delta updates from backend
      await _pullRemoteChanges();

      // Update sync markers
      final now = DateTime.now();
      lastSuccessfulSync.value = now;
      await localDb.setLastSyncTime('global', now);

      pendingMutationsCount.value = queue.pendingCount;
      syncStatus.value = pendingMutationsCount.value > 0 ? SyncStatus.pending : SyncStatus.synced;

      Get.log('[SYNC] Synchronization cycle completed successfully.');
    } catch (e) {
      Get.log('[SYNC] Sync failed with error: $e');
      lastSyncError.value = e.toString();
      syncStatus.value = SyncStatus.failed;
    } finally {
      _isSyncRunning = false;
    }
  }

  /// Process queued mutations in FIFO order with idempotency & error tolerance
  Future<void> _pushPendingMutations() async {
    final now = DateTime.now();
    final eligible = queue.getEligibleMutations(now);
    if (eligible.isEmpty) return;

    Get.log('[SYNC] Found ${eligible.length} eligible mutation(s) to push.');
    final supabase = Supabase.instance.client;

    for (final mutation in eligible) {
      await queue.markInFlight(mutation.id);

      try {
        switch (mutation.entityType) {
          case MutationEntityType.animal:
            await _dispatchAnimalMutation(mutation, supabase);
            break;
          case MutationEntityType.treatment:
            await _dispatchTreatmentMutation(mutation, supabase);
            break;
          case MutationEntityType.withdrawal:
            await _dispatchWithdrawalMutation(mutation, supabase);
            break;
          case MutationEntityType.diseaseReport:
            await _dispatchDiseaseReportMutation(mutation, supabase);
            break;
          case MutationEntityType.vaccination:
            await _dispatchVaccinationMutation(mutation, supabase);
            break;
          case MutationEntityType.medicine:
            await _dispatchMedicineMutation(mutation, supabase);
            break;
          case MutationEntityType.labResult:
            await _dispatchLabResultMutation(mutation, supabase);
            break;
          case MutationEntityType.userProfile:
            await _dispatchUserProfileMutation(mutation, supabase);
            break;
          case MutationEntityType.unknown:
            break;
        }

        // Successfully pushed: remove mutation from queue
        await queue.markSuccess(mutation.id);
      } catch (e) {
        Get.log('[SYNC] Failed to push mutation ${mutation.id}: $e');
        await queue.markFailed(mutation.id, e.toString());
        // If network error occurred, break batch and wait for next sync cycle
        if (e is PostgrestException || e is DioException || e is SocketException) {
          break;
        }
      }
    }
  }

  Future<void> _dispatchAnimalMutation(SyncMutation mutation, SupabaseClient supabase) async {
    final cleanPayload = Map<String, dynamic>.from(mutation.payload);
    cleanPayload.remove('treatments');
    cleanPayload.remove('withdrawals');
    cleanPayload.remove('local_updated_at');
    cleanPayload.remove('sync_status');

    if (mutation.operation == MutationOperation.create) {
      final res = await supabase.from('animals').upsert(cleanPayload).select().maybeSingle();
      if (res != null) {
        final serverMap = Map<String, dynamic>.from(res);
        serverMap['sync_status'] = 'synced';
        await localDb.saveAnimalMap(serverMap);
      }
    } else if (mutation.operation == MutationOperation.update) {
      final res = await supabase.from('animals').update(cleanPayload).eq('id', mutation.clientEntityId).select().maybeSingle();
      if (res != null) {
        final serverMap = Map<String, dynamic>.from(res);
        serverMap['sync_status'] = 'synced';
        await localDb.saveAnimalMap(serverMap);
      }
    } else if (mutation.operation == MutationOperation.delete) {
      await supabase.from('animals').update({'is_deleted': true}).eq('id', mutation.clientEntityId);
    }
  }

  Future<void> _dispatchTreatmentMutation(SyncMutation mutation, SupabaseClient supabase) async {
    final cleanPayload = Map<String, dynamic>.from(mutation.payload);
    cleanPayload.remove('local_updated_at');
    cleanPayload.remove('sync_status');

    final res = await supabase.from('treatments').upsert(cleanPayload).select().single();
    final treatmentId = res['id']?.toString() ?? mutation.clientEntityId;

    // Auto-create or sync corresponding withdrawal record if applicable
    final animalId = cleanPayload['animal_id']?.toString();
    if (animalId != null && animalId.isNotEmpty) {
      final startDateStr = cleanPayload['start_date']?.toString();
      final duration = int.tryParse(cleanPayload['duration']?.toString() ?? '3') ?? 3;
      final start = DateTime.tryParse(startDateStr ?? '') ?? DateTime.now();
      final end = start.add(Duration(days: duration + 4)); // standard withdrawal default

      try {
        await supabase.from('withdrawals').upsert({
          'treatment_id': treatmentId,
          'animal_id': animalId,
          'product': cleanPayload['product_affected'] ?? 'milk',
          'start_date': start.toIso8601String(),
          'end_date': end.toIso8601String(),
          'status': 'active',
        });
      } catch (wErr) {
        Get.log('[SYNC] Withdrawal auto-sync note: $wErr');
      }
    }
  }

  Future<void> _dispatchWithdrawalMutation(SyncMutation mutation, SupabaseClient supabase) async {
    final cleanPayload = Map<String, dynamic>.from(mutation.payload);
    cleanPayload.remove('local_updated_at');
    cleanPayload.remove('sync_status');
    cleanPayload.remove('animals');
    await supabase.from('withdrawals').upsert(cleanPayload);
  }

  Future<void> _dispatchDiseaseReportMutation(SyncMutation mutation, SupabaseClient supabase) async {
    final payload = Map<String, dynamic>.from(mutation.payload);
    // 1. Try surveillance API
    bool pushedViaApi = false;
    try {
      final res = await _surveillanceDio.post('/v1/surveillance/report', data: payload);
      if (res.statusCode == 200 || res.statusCode == 201) {
        pushedViaApi = true;
      }
    } catch (_) {}

    // 2. Also ensure persistence in Supabase disease_reports table
    try {
      await supabase.from('disease_reports').upsert({
        'species': payload['species'],
        'symptoms': payload['symptoms'],
        'suspected_disease': payload['suspected_disease'] ?? 'Syndromic Anomaly',
        'triage_severity': payload['triage_severity'] ?? 'MODERATE',
        'latitude': payload['latitude'] ?? 18.5793,
        'longitude': payload['longitude'] ?? 73.9824,
        'affected_count': payload['affected_count'] ?? 1,
        'mortality_count': payload['mortality_count'] ?? 0,
        'status': 'reported',
      });
    } catch (e) {
      if (!pushedViaApi) rethrow;
    }
  }

  Future<void> _dispatchVaccinationMutation(SyncMutation mutation, SupabaseClient supabase) async {
    final cleanPayload = Map<String, dynamic>.from(mutation.payload);
    cleanPayload.remove('local_updated_at');
    cleanPayload.remove('sync_status');
    await supabase.from('vaccinations').upsert({
      'animal_id': cleanPayload['animal_id'],
      'vaccine_name': cleanPayload['vaccine_name'],
      'disease_targeted': cleanPayload['disease_targeted'],
      'batch_number': cleanPayload['batch_number'],
      'administered_date': cleanPayload['administered_date'],
      'booster_due_date': cleanPayload['booster_due_date'],
      'veterinarian': cleanPayload['veterinarian'],
    });
  }

  Future<void> _dispatchMedicineMutation(SyncMutation mutation, SupabaseClient supabase) async {
    final cleanPayload = Map<String, dynamic>.from(mutation.payload);
    cleanPayload.remove('local_updated_at');
    cleanPayload.remove('sync_status');
    cleanPayload.remove('regulatory_rules');

    final medRes = await supabase.from('medicines').upsert(cleanPayload).select().single();
    final medId = medRes['id'];

    if (mutation.payload['regulatory_rules'] is List) {
      for (var rule in mutation.payload['regulatory_rules']) {
        final rMap = Map<String, dynamic>.from(rule as Map);
        rMap['medicine_id'] = medId;
        await supabase.from('regulatory_rules').upsert(rMap);
      }
    }
  }

  Future<void> _dispatchLabResultMutation(SyncMutation mutation, SupabaseClient supabase) async {
    final cleanPayload = Map<String, dynamic>.from(mutation.payload);
    cleanPayload.remove('local_updated_at');
    cleanPayload.remove('sync_status');
    await supabase.from('lab_results').upsert(cleanPayload);
  }

  Future<void> _dispatchUserProfileMutation(SyncMutation mutation, SupabaseClient supabase) async {
    await supabase.from('users').upsert(mutation.payload);
  }

  /// Pull remote updates and reconcile into local database
  Future<void> _pullRemoteChanges() async {
    final supabase = Supabase.instance.client;

    // 1. Pull Animals
    try {
      final remoteAnimals = await supabase.from('animals').select().order('created_at', ascending: false);
      if (remoteAnimals.isNotEmpty) {
        final List<Map<String, dynamic>> resolvedList = [];
        for (var item in remoteAnimals) {
          final remoteMap = Map<String, dynamic>.from(item);
          final id = remoteMap['id']?.toString() ?? '';
          final local = localDb.getAnimalById(id);

          if (local != null) {
            final merged = ConflictResolver.resolveAnimalConflict(
              local: local.toMap(),
              remote: remoteMap,
            );
            resolvedList.add(merged);
          } else {
            resolvedList.add(remoteMap);
          }
        }
        await localDb.saveAnimalsBatch(resolvedList);
        Get.log('[SYNC] Pulled and reconciled ${resolvedList.length} animals.');
      }
    } catch (e) {
      Get.log('[SYNC] Animals pull notice: $e');
    }

    // 2. Pull Treatments
    try {
      final remoteTreatments = await supabase.from('treatments').select().order('start_date', ascending: false);
      if (remoteTreatments.isNotEmpty) {
        final List<Map<String, dynamic>> list = remoteTreatments.map((t) => Map<String, dynamic>.from(t)).toList();
        await localDb.saveTreatmentsBatch(list);
        Get.log('[SYNC] Pulled ${list.length} treatments.');
      }
    } catch (e) {
      Get.log('[SYNC] Treatments pull notice: $e');
    }

    // 3. Pull Withdrawals
    try {
      final remoteWithdrawals = await supabase.from('withdrawals').select().order('end_date', ascending: true);
      if (remoteWithdrawals.isNotEmpty) {
        final List<Map<String, dynamic>> list = remoteWithdrawals.map((w) => Map<String, dynamic>.from(w)).toList();
        await localDb.saveWithdrawalsBatch(list);
        Get.log('[SYNC] Pulled ${list.length} withdrawals.');
      }
    } catch (e) {
      Get.log('[SYNC] Withdrawals pull notice: $e');
    }

    // 4. Pull Medicines & Regulatory Rules
    try {
      final remoteMedicines = await supabase.from('medicines').select('*, regulatory_rules(*)').order('name', ascending: true);
      if (remoteMedicines.isNotEmpty) {
        final List<Map<String, dynamic>> list = remoteMedicines.map((m) => Map<String, dynamic>.from(m)).toList();
        await localDb.saveMedicinesBatch(list);

        final List<Map<String, dynamic>> allRules = [];
        for (var m in list) {
          if (m['regulatory_rules'] is List) {
            for (var r in m['regulatory_rules']) {
              allRules.add(Map<String, dynamic>.from(r as Map));
            }
          }
        }
        if (allRules.isNotEmpty) {
          await localDb.saveRegulatoryRulesBatch(allRules);
        }
        Get.log('[SYNC] Pulled ${list.length} medicines and ${allRules.length} rules.');
      }
    } catch (e) {
      Get.log('[SYNC] Medicines pull notice: $e');
    }

    // 5. Pull Alerts
    try {
      final remoteAlerts = await supabase.from('alerts').select().order('created_at', ascending: false).limit(50);
      if (remoteAlerts.isNotEmpty) {
        final List<Map<String, dynamic>> list = remoteAlerts.map((a) => Map<String, dynamic>.from(a)).toList();
        await localDb.saveAlertsBatch(list);
        Get.log('[SYNC] Pulled ${list.length} alerts.');
      }
    } catch (e) {
      Get.log('[SYNC] Alerts pull notice: $e');
    }

    // 6. Pull Vaccinations
    try {
      final remoteVacs = await supabase.from('vaccinations').select().order('administered_date', ascending: false);
      if (remoteVacs.isNotEmpty) {
        final List<Map<String, dynamic>> list = remoteVacs.map((v) => Map<String, dynamic>.from(v)).toList();
        await localDb.saveVaccinationsBatch(list);
      }
    } catch (e) {
      Get.log('[SYNC] Vaccinations pull notice: $e');
    }

    // 7. Pull Disease Reports
    try {
      final remoteReports = await supabase.from('disease_reports').select().order('created_at', ascending: false).limit(100);
      if (remoteReports.isNotEmpty) {
        final List<Map<String, dynamic>> list = remoteReports.map((r) => Map<String, dynamic>.from(r)).toList();
        await localDb.saveDiseaseReportsBatch(list);
      }
    } catch (e) {
      Get.log('[SYNC] Disease reports pull notice: $e');
    }

    // 8. Pull Lab Results
    try {
      final remoteLab = await supabase.from('lab_results').select().order('test_date', ascending: false);
      if (remoteLab.isNotEmpty) {
        final List<Map<String, dynamic>> list = remoteLab.map((l) => Map<String, dynamic>.from(l)).toList();
        await localDb.saveLabResultsBatch(list);
      }
    } catch (e) {
      Get.log('[SYNC] Lab results pull notice: $e');
    }
  }

  @override
  void onClose() {
    WidgetsBinding.instance.removeObserver(this);
    _debounceTimer?.cancel();
    super.onClose();
  }
}

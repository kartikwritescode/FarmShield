import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../models/farm_models.dart';
import '../models/geo_risk_model.dart';
import '../models/health_models.dart';

class LocalDatabaseService {
  static final LocalDatabaseService _instance = LocalDatabaseService._internal();
  factory LocalDatabaseService() => _instance;
  LocalDatabaseService._internal();

  static const int currentSchemaVersion = 2;

  // Dedicated Box Names
  static const String boxAnimals = 'fs_animals_v2';
  static const String boxTreatments = 'fs_treatments_v2';
  static const String boxWithdrawals = 'fs_withdrawals_v2';
  static const String boxMedicines = 'fs_medicines_v2';
  static const String boxRegulatoryRules = 'fs_regulatory_rules_v2';
  static const String boxVaccinations = 'fs_vaccinations_v2';
  static const String boxDiseaseReports = 'fs_disease_reports_v2';
  static const String boxLabResults = 'fs_lab_results_v2';
  static const String boxAlerts = 'fs_alerts_v2';
  static const String boxRiskPoints = 'fs_risk_points_v2';
  static const String boxUserProfile = 'fs_user_profile_v2';
  static const String boxSyncQueue = 'fs_sync_queue_v2';
  static const String boxMetadata = 'fs_metadata_v2';

  late Box _animalsBox;
  late Box _treatmentsBox;
  late Box _withdrawalsBox;
  late Box _medicinesBox;
  late Box _regulatoryRulesBox;
  late Box _vaccinationsBox;
  late Box _diseaseReportsBox;
  late Box _labResultsBox;
  late Box _alertsBox;
  late Box _riskPointsBox;
  late Box _userProfileBox;
  late Box _syncQueueBox;
  late Box _metadataBox;

  Box get syncQueueBox => _syncQueueBox;
  Box get metadataBox => _metadataBox;

  bool _isInitialized = false;
  bool get isInitialized => _isInitialized;

  Future<void> init({String? customPath}) async {
    if (_isInitialized) return;

    if (customPath != null) {
      Hive.init(customPath);
    } else {
      await Hive.initFlutter();
    }

    _animalsBox = await Hive.openBox(boxAnimals);
    _treatmentsBox = await Hive.openBox(boxTreatments);
    _withdrawalsBox = await Hive.openBox(boxWithdrawals);
    _medicinesBox = await Hive.openBox(boxMedicines);
    _regulatoryRulesBox = await Hive.openBox(boxRegulatoryRules);
    _vaccinationsBox = await Hive.openBox(boxVaccinations);
    _diseaseReportsBox = await Hive.openBox(boxDiseaseReports);
    _labResultsBox = await Hive.openBox(boxLabResults);
    _alertsBox = await Hive.openBox(boxAlerts);
    _riskPointsBox = await Hive.openBox(boxRiskPoints);
    _userProfileBox = await Hive.openBox(boxUserProfile);
    _syncQueueBox = await Hive.openBox(boxSyncQueue);
    _metadataBox = await Hive.openBox(boxMetadata);

    await _runDatabaseMigrations();
    _isInitialized = true;
  }

  /// Safe Database Migration System (v1 legacy boxes -> v2 structured collections)
  Future<void> _runDatabaseMigrations() async {
    final int existingVersion = (_metadataBox.get('schema_version') as int?) ?? 1;

    if (existingVersion < 2) {
      debugPrint('[LOCAL_DB] Running migration from schema v$existingVersion to v2...');

      // 1. Migrate legacy animalsBox if present
      if (await Hive.boxExists('animalsBox')) {
        try {
          final oldBox = await Hive.openBox('animalsBox');
          for (var key in oldBox.keys) {
            final val = oldBox.get(key);
            if (val is Map) {
              final id = val['id']?.toString() ?? key.toString();
              await _animalsBox.put(id, Map<String, dynamic>.from(val));
            }
          }
          debugPrint('[LOCAL_DB] Migrated ${oldBox.length} animals from legacy box.');
        } catch (e) {
          debugPrint('[LOCAL_DB] Legacy animals migration error: $e');
        }
      }

      // 2. Migrate legacy treatmentsBox if present
      if (await Hive.boxExists('treatmentsBox')) {
        try {
          final oldBox = await Hive.openBox('treatmentsBox');
          for (var key in oldBox.keys) {
            final val = oldBox.get(key);
            if (val is Map) {
              final id = val['id']?.toString() ?? 't_mig_${DateTime.now().millisecondsSinceEpoch}_$key';
              await _treatmentsBox.put(id, Map<String, dynamic>.from(val));
            }
          }
          debugPrint('[LOCAL_DB] Migrated ${oldBox.length} treatments from legacy box.');
        } catch (e) {
          debugPrint('[LOCAL_DB] Legacy treatments migration error: $e');
        }
      }

      // 3. Migrate legacy offlineReportsBox
      if (await Hive.boxExists('offlineReportsBox')) {
        try {
          final oldBox = await Hive.openBox('offlineReportsBox');
          for (var key in oldBox.keys) {
            if (key == 'cached_risk_points') continue;
            final val = oldBox.get(key);
            if (val is Map) {
              final id = val['client_report_id']?.toString() ?? val['id']?.toString() ?? key.toString();
              await _diseaseReportsBox.put(id, Map<String, dynamic>.from(val));
            }
          }
          debugPrint('[LOCAL_DB] Migrated ${oldBox.length} disease reports from legacy box.');
        } catch (e) {
          debugPrint('[LOCAL_DB] Legacy disease reports migration error: $e');
        }
      }

      // 4. Migrate legacy offlineVaccinationsBox
      if (await Hive.boxExists('offlineVaccinationsBox')) {
        try {
          final oldBox = await Hive.openBox('offlineVaccinationsBox');
          for (var key in oldBox.keys) {
            final val = oldBox.get(key);
            if (val is Map) {
              final id = val['id']?.toString() ?? key.toString();
              await _vaccinationsBox.put(id, Map<String, dynamic>.from(val));
            }
          }
          debugPrint('[LOCAL_DB] Migrated ${oldBox.length} vaccinations from legacy box.');
        } catch (e) {
          debugPrint('[LOCAL_DB] Legacy vaccinations migration error: $e');
        }
      }

      // 5. Migrate legacy offlineQueueBox into new sync queue
      if (await Hive.boxExists('offlineQueueBox')) {
        try {
          final oldBox = await Hive.openBox('offlineQueueBox');
          for (var key in oldBox.keys) {
            final item = oldBox.get(key);
            if (item is Map) {
              final mutationId = 'mut_mig_${DateTime.now().millisecondsSinceEpoch}_$key';
              await _syncQueueBox.put(mutationId, {
                'id': mutationId,
                'entityType': item['type'] ?? 'unknown',
                'operation': 'create',
                'clientEntityId': item['client_id'] ?? item['data']?['id'] ?? mutationId,
                'payload': item['data'] is Map ? Map<String, dynamic>.from(item['data']) : {},
                'timestamp': DateTime.now().toIso8601String(),
                'retryCount': 0,
                'status': 'pending',
              });
            }
          }
          debugPrint('[LOCAL_DB] Migrated ${oldBox.length} queue items from legacy box.');
        } catch (e) {
          debugPrint('[LOCAL_DB] Legacy queue migration error: $e');
        }
      }

      await _metadataBox.put('schema_version', currentSchemaVersion);
      debugPrint('[LOCAL_DB] Migration completed successfully. New schema version: $currentSchemaVersion');
    }
  }

  // -------------------------------------------------------------
  // ANIMALS API
  // -------------------------------------------------------------
  List<Animal> getAllAnimals({String? species, String? status}) {
    final list = <Animal>[];
    for (var val in _animalsBox.values) {
      if (val is Map) {
        try {
          final map = Map<String, dynamic>.from(val);
          if (map['is_deleted'] == true) continue;
          final animal = Animal.fromJson(map);

          if (species != null && species != 'all') {
            if ((animal.species ?? '').toLowerCase() != species.toLowerCase()) continue;
          }
          if (status != null) {
            if ((animal.healthStatus ?? '').toLowerCase() != status.toLowerCase()) continue;
          }
          list.add(animal);
        } catch (e) {
          debugPrint('[LOCAL_DB] Animal parsing error: $e');
        }
      }
    }
    return list;
  }

  Stream<BoxEvent> watchAnimals() => _animalsBox.watch();

  Animal? getAnimalById(String id) {
    // 1. Direct key
    final direct = _animalsBox.get(id);
    if (direct is Map) return Animal.fromJson(Map<String, dynamic>.from(direct));

    // 2. Search values by id, animal_code, qr_token
    for (var val in _animalsBox.values) {
      if (val is Map) {
        if (val['id']?.toString() == id ||
            val['animal_code']?.toString() == id ||
            val['qr_token']?.toString() == id) {
          return Animal.fromJson(Map<String, dynamic>.from(val));
        }
      }
    }
    return null;
  }

  Future<void> saveAnimal(Animal animal, {bool markLocalUpdate = false}) async {
    final id = animal.id ?? animal.animalCode ?? 'animal_${DateTime.now().millisecondsSinceEpoch}';
    final map = animal.toMap();
    if (markLocalUpdate) {
      map['local_updated_at'] = DateTime.now().toIso8601String();
      map['sync_status'] = 'pending';
    }
    await _animalsBox.put(id, map);
  }

  Future<void> saveAnimalMap(Map<String, dynamic> animalMap, {bool markLocalUpdate = false}) async {
    final id = animalMap['id']?.toString() ?? animalMap['animal_code']?.toString() ?? 'animal_${DateTime.now().millisecondsSinceEpoch}';
    final copy = Map<String, dynamic>.from(animalMap);
    if (markLocalUpdate) {
      copy['local_updated_at'] = DateTime.now().toIso8601String();
      copy['sync_status'] = 'pending';
    }
    await _animalsBox.put(id, copy);
  }

  Future<void> saveAnimalsBatch(List<Map<String, dynamic>> animalsList) async {
    final Map<String, Map<String, dynamic>> entries = {};
    for (var a in animalsList) {
      final id = a['id']?.toString() ?? a['animal_code']?.toString();
      if (id != null && id.isNotEmpty) {
        entries[id] = a;
      }
    }
    await _animalsBox.putAll(entries);
  }

  Future<void> deleteAnimalLocally(String id) async {
    final existing = _animalsBox.get(id);
    if (existing is Map) {
      final map = Map<String, dynamic>.from(existing);
      map['is_deleted'] = true;
      map['local_updated_at'] = DateTime.now().toIso8601String();
      map['sync_status'] = 'pending_delete';
      await _animalsBox.put(id, map);
    } else {
      await _animalsBox.delete(id);
    }
  }

  // -------------------------------------------------------------
  // TREATMENTS API
  // -------------------------------------------------------------
  List<Treatment> getAllTreatments({String? animalId}) {
    final list = <Treatment>[];
    for (var val in _treatmentsBox.values) {
      if (val is Map) {
        try {
          final map = Map<String, dynamic>.from(val);
          if (map['is_deleted'] == true) continue;
          if (animalId != null && map['animal_id']?.toString() != animalId) continue;
          list.add(Treatment.fromJson(map));
        } catch (_) {}
      }
    }
    list.sort((a, b) => (b.startDate ?? DateTime.now()).compareTo(a.startDate ?? DateTime.now()));
    return list;
  }

  Stream<BoxEvent> watchTreatments() => _treatmentsBox.watch();

  Future<void> saveTreatment(Treatment treatment, {bool markLocalUpdate = false}) async {
    final id = treatment.id ?? 'tr_${DateTime.now().millisecondsSinceEpoch}';
    treatment.id = id;
    final map = treatment.toJson();
    if (markLocalUpdate) {
      map['local_updated_at'] = DateTime.now().toIso8601String();
      map['sync_status'] = 'pending';
    }
    await _treatmentsBox.put(id, map);
  }

  Future<void> saveTreatmentsBatch(List<Map<String, dynamic>> list) async {
    final Map<String, Map<String, dynamic>> entries = {};
    for (var t in list) {
      final id = t['id']?.toString();
      if (id != null) entries[id] = t;
    }
    await _treatmentsBox.putAll(entries);
  }

  // -------------------------------------------------------------
  // WITHDRAWALS API
  // -------------------------------------------------------------
  List<Withdrawal> getAllWithdrawals({String? animalId}) {
    final list = <Withdrawal>[];
    for (var val in _withdrawalsBox.values) {
      if (val is Map) {
        try {
          final map = Map<String, dynamic>.from(val);
          if (map['is_deleted'] == true) continue;
          if (animalId != null && map['animal_id']?.toString() != animalId) continue;
          list.add(Withdrawal.fromJson(map));
        } catch (_) {}
      }
    }
    list.sort((a, b) => a.endDate.compareTo(b.endDate));
    return list;
  }

  Stream<BoxEvent> watchWithdrawals() => _withdrawalsBox.watch();

  Future<void> saveWithdrawal(Withdrawal withdrawal, {bool markLocalUpdate = false}) async {
    final map = {
      'id': withdrawal.id,
      'treatment_id': withdrawal.treatmentId,
      'animal_id': withdrawal.animalId,
      'product': withdrawal.product,
      'start_date': withdrawal.startDate.toIso8601String(),
      'end_date': withdrawal.endDate.toIso8601String(),
      'status': withdrawal.status,
      'medicine_name': withdrawal.medicineName,
      'indication': withdrawal.indication,
      'dosage': withdrawal.dosage,
      if (withdrawal.animal != null) 'animals': withdrawal.animal!.toJson(),
    };
    if (markLocalUpdate) {
      map['local_updated_at'] = DateTime.now().toIso8601String();
      map['sync_status'] = 'pending';
    }
    await _withdrawalsBox.put(withdrawal.id, map);
  }

  Future<void> saveWithdrawalsBatch(List<Map<String, dynamic>> list) async {
    final Map<String, Map<String, dynamic>> entries = {};
    for (var w in list) {
      final id = w['id']?.toString();
      if (id != null) entries[id] = w;
    }
    await _withdrawalsBox.putAll(entries);
  }

  // -------------------------------------------------------------
  // MEDICINES & REGULATORY RULES API
  // -------------------------------------------------------------
  List<Medicine> getAllMedicines() {
    final list = <Medicine>[];
    for (var val in _medicinesBox.values) {
      if (val is Map) {
        try {
          final map = Map<String, dynamic>.from(val);
          final rules = getRulesForMedicine(map['id']?.toString() ?? '');
          if (rules.isNotEmpty) {
            map['regulatory_rules'] = rules.map((r) => r.toJson()).toList();
          }
          list.add(Medicine.fromJson(map));
        } catch (_) {}
      }
    }
    list.sort((a, b) => (a.name ?? '').compareTo(b.name ?? ''));
    return list;
  }

  Stream<BoxEvent> watchMedicines() => _medicinesBox.watch();

  Future<void> saveMedicine(Medicine medicine, {bool markLocalUpdate = false}) async {
    final id = medicine.id ?? 'med_${DateTime.now().millisecondsSinceEpoch}';
    final map = medicine.toJson();
    map['id'] = id;
    if (markLocalUpdate) {
      map['local_updated_at'] = DateTime.now().toIso8601String();
      map['sync_status'] = 'pending';
    }
    await _medicinesBox.put(id, map);

    if (medicine.rules != null && medicine.rules!.isNotEmpty) {
      for (var rule in medicine.rules!) {
        rule.medicineId = id;
        await saveRegulatoryRule(rule, markLocalUpdate: markLocalUpdate);
      }
    }
  }

  Future<void> saveMedicinesBatch(List<Map<String, dynamic>> list) async {
    final Map<String, Map<String, dynamic>> entries = {};
    for (var m in list) {
      final id = m['id']?.toString();
      if (id != null) entries[id] = m;
    }
    await _medicinesBox.putAll(entries);
  }

  List<RegulatoryRule> getRulesForMedicine(String medicineId) {
    final list = <RegulatoryRule>[];
    for (var val in _regulatoryRulesBox.values) {
      if (val is Map && val['medicine_id']?.toString() == medicineId) {
        try {
          list.add(RegulatoryRule.fromJson(Map<String, dynamic>.from(val)));
        } catch (_) {}
      }
    }
    return list;
  }

  Future<void> saveRegulatoryRule(RegulatoryRule rule, {bool markLocalUpdate = false}) async {
    final id = rule.id ?? 'rule_${DateTime.now().millisecondsSinceEpoch}';
    rule.id = id;
    final map = rule.toJson();
    map['id'] = id;
    if (markLocalUpdate) {
      map['local_updated_at'] = DateTime.now().toIso8601String();
      map['sync_status'] = 'pending';
    }
    await _regulatoryRulesBox.put(id, map);
  }

  Future<void> saveRegulatoryRulesBatch(List<Map<String, dynamic>> list) async {
    final Map<String, Map<String, dynamic>> entries = {};
    for (var r in list) {
      final id = r['id']?.toString();
      if (id != null) entries[id] = r;
    }
    await _regulatoryRulesBox.putAll(entries);
  }

  // -------------------------------------------------------------
  // VACCINATIONS API
  // -------------------------------------------------------------
  List<VaccinationRecord> getAllVaccinations({String? animalId}) {
    final list = <VaccinationRecord>[];
    for (var val in _vaccinationsBox.values) {
      if (val is Map) {
        try {
          final map = Map<String, dynamic>.from(val);
          if (animalId != null && map['animal_id']?.toString() != animalId) continue;
          list.add(VaccinationRecord.fromJson(map));
        } catch (_) {}
      }
    }
    list.sort((a, b) => b.administeredDate.compareTo(a.administeredDate));
    return list;
  }

  Future<void> saveVaccination(VaccinationRecord vax, {bool markLocalUpdate = false}) async {
    final id = vax.id.isNotEmpty ? vax.id : 'vac_${DateTime.now().millisecondsSinceEpoch}';
    final map = vax.toJson();
    map['id'] = id;
    if (markLocalUpdate) {
      map['local_updated_at'] = DateTime.now().toIso8601String();
      map['sync_status'] = 'pending';
    }
    await _vaccinationsBox.put(id, map);
  }

  Future<void> saveVaccinationsBatch(List<Map<String, dynamic>> list) async {
    final Map<String, Map<String, dynamic>> entries = {};
    for (var v in list) {
      final id = v['id']?.toString();
      if (id != null) entries[id] = v;
    }
    await _vaccinationsBox.putAll(entries);
  }

  // -------------------------------------------------------------
  // DISEASE & SYNDROMIC REPORTS API
  // -------------------------------------------------------------
  List<Map<String, dynamic>> getAllDiseaseReports({String? animalId}) {
    final list = <Map<String, dynamic>>[];
    for (var val in _diseaseReportsBox.values) {
      if (val is Map) {
        final map = Map<String, dynamic>.from(val);
        if (animalId != null &&
            animalId.isNotEmpty &&
            map['animal_id']?.toString() != animalId &&
            map['animal_code']?.toString() != animalId) {
          continue;
        }
        list.add(map);
      }
    }
    list.sort((a, b) {
      final da = DateTime.tryParse(a['created_at']?.toString() ?? '') ?? DateTime(1970);
      final db = DateTime.tryParse(b['created_at']?.toString() ?? '') ?? DateTime(1970);
      return db.compareTo(da);
    });
    return list;
  }

  Future<void> saveDiseaseReport(Map<String, dynamic> report, {bool markLocalUpdate = false}) async {
    final id = report['client_report_id']?.toString() ??
        report['id']?.toString() ??
        'rep_${DateTime.now().millisecondsSinceEpoch}';
    final copy = Map<String, dynamic>.from(report);
    copy['client_report_id'] = id;
    copy['id'] ??= id;
    copy['created_at'] ??= DateTime.now().toIso8601String();
    if (markLocalUpdate) {
      copy['local_updated_at'] = DateTime.now().toIso8601String();
      copy['sync_status'] = 'pending';
    }
    await _diseaseReportsBox.put(id, copy);
  }

  Future<void> saveDiseaseReportsBatch(List<Map<String, dynamic>> list) async {
    final Map<String, Map<String, dynamic>> entries = {};
    for (var r in list) {
      final id = r['client_report_id']?.toString() ?? r['id']?.toString();
      if (id != null) entries[id] = r;
    }
    await _diseaseReportsBox.putAll(entries);
  }

  // -------------------------------------------------------------
  // LAB RESULTS API
  // -------------------------------------------------------------
  List<Map<String, dynamic>> getAllLabResults({String? animalId}) {
    final list = <Map<String, dynamic>>[];
    for (var val in _labResultsBox.values) {
      if (val is Map) {
        final map = Map<String, dynamic>.from(val);
        if (animalId != null && map['animal_id']?.toString() != animalId) continue;
        list.add(map);
      }
    }
    return list;
  }

  Future<void> saveLabResult(Map<String, dynamic> result, {bool markLocalUpdate = false}) async {
    final id = result['id']?.toString() ?? 'lab_${DateTime.now().millisecondsSinceEpoch}';
    final copy = Map<String, dynamic>.from(result);
    copy['id'] = id;
    if (markLocalUpdate) {
      copy['local_updated_at'] = DateTime.now().toIso8601String();
      copy['sync_status'] = 'pending';
    }
    await _labResultsBox.put(id, copy);
  }

  Future<void> saveLabResultsBatch(List<Map<String, dynamic>> list) async {
    final Map<String, Map<String, dynamic>> entries = {};
    for (var l in list) {
      final id = l['id']?.toString();
      if (id != null) entries[id] = l;
    }
    await _labResultsBox.putAll(entries);
  }

  // -------------------------------------------------------------
  // ALERTS API
  // -------------------------------------------------------------
  List<Alert> getAllAlerts() {
    final list = <Alert>[];
    for (var val in _alertsBox.values) {
      if (val is Map) {
        try {
          list.add(Alert.fromJson(Map<String, dynamic>.from(val)));
        } catch (_) {}
      }
    }
    list.sort((a, b) => (b.timestamp ?? DateTime.now()).compareTo(a.timestamp ?? DateTime.now()));
    return list;
  }

  Stream<BoxEvent> watchAlerts() => _alertsBox.watch();

  Future<void> saveAlert(Alert alert) async {
    final id = alert.id ?? 'alert_${DateTime.now().millisecondsSinceEpoch}';
    await _alertsBox.put(id, {
      'id': id,
      'title': alert.title,
      'message': alert.message,
      'message_hi': alert.messageHi,
      'type': alert.type,
      'severity': alert.severity,
      'status': alert.status,
      'timestamp': alert.timestamp?.toIso8601String() ?? DateTime.now().toIso8601String(),
    });
  }

  Future<void> saveAlertsBatch(List<Map<String, dynamic>> list) async {
    final Map<String, Map<String, dynamic>> entries = {};
    for (var a in list) {
      final id = a['id']?.toString();
      if (id != null) entries[id] = a;
    }
    await _alertsBox.putAll(entries);
  }

  // -------------------------------------------------------------
  // RISK POINTS API
  // -------------------------------------------------------------
  List<AnimalRiskPoint> getCachedRiskPoints() {
    final list = <AnimalRiskPoint>[];
    for (var val in _riskPointsBox.values) {
      if (val is Map) {
        try {
          list.add(AnimalRiskPoint.fromJson(Map<String, dynamic>.from(val)));
        } catch (_) {}
      }
    }
    return list;
  }

  Future<void> saveRiskPoints(List<AnimalRiskPoint> points) async {
    final Map<String, Map<String, dynamic>> entries = {};
    for (var p in points) {
      entries[p.id] = p.toJson();
    }
    await _riskPointsBox.putAll(entries);
  }

  // -------------------------------------------------------------
  // USER PROFILE API
  // -------------------------------------------------------------
  Map<String, dynamic>? getUserProfile(String userId) {
    final val = _userProfileBox.get(userId);
    if (val is Map) return Map<String, dynamic>.from(val);
    return null;
  }

  Map<String, dynamic>? getLatestUserProfile() {
    if (_userProfileBox.isNotEmpty) {
      final first = _userProfileBox.values.first;
      if (first is Map) return Map<String, dynamic>.from(first);
    }
    return null;
  }

  Future<void> saveUserProfile(Map<String, dynamic> profile) async {
    final id = profile['id']?.toString() ?? 'current_user';
    await _userProfileBox.put(id, profile);
  }

  // -------------------------------------------------------------
  // SYNC METADATA API
  // -------------------------------------------------------------
  DateTime? getLastSyncTime(String entityName) {
    final val = _metadataBox.get('last_sync_$entityName');
    if (val != null) {
      return DateTime.tryParse(val.toString());
    }
    return null;
  }

  Future<void> setLastSyncTime(String entityName, DateTime time) async {
    await _metadataBox.put('last_sync_$entityName', time.toIso8601String());
  }

  // -------------------------------------------------------------
  // DATABASE STATS FOR DIAGNOSTICS & DEBUG SCREEN
  // -------------------------------------------------------------
  Map<String, int> getDatabaseStats() {
    return {
      'animals': _animalsBox.length,
      'treatments': _treatmentsBox.length,
      'withdrawals': _withdrawalsBox.length,
      'medicines': _medicinesBox.length,
      'regulatoryRules': _regulatoryRulesBox.length,
      'vaccinations': _vaccinationsBox.length,
      'diseaseReports': _diseaseReportsBox.length,
      'labResults': _labResultsBox.length,
      'alerts': _alertsBox.length,
      'riskPoints': _riskPointsBox.length,
      'pendingMutations': _syncQueueBox.length,
    };
  }

  Future<void> clearAllDataForTesting() async {
    await _animalsBox.clear();
    await _treatmentsBox.clear();
    await _withdrawalsBox.clear();
    await _medicinesBox.clear();
    await _regulatoryRulesBox.clear();
    await _vaccinationsBox.clear();
    await _diseaseReportsBox.clear();
    await _labResultsBox.clear();
    await _alertsBox.clear();
    await _riskPointsBox.clear();
    await _syncQueueBox.clear();
  }

  Future<void> closeForTesting() async {
    await Hive.close();
    _isInitialized = false;
  }
}

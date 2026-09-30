import 'package:get/get.dart';
import '../../data/models/farm_models.dart';
import '../../data/models/geo_risk_model.dart';
import '../../data/models/health_models.dart';
import '../../data/services/local_database_service.dart';
import '../../data/sync/sync_engine.dart';
import '../../data/sync/sync_mutation.dart';
import '../../data/sync/sync_queue.dart';

/// Legacy bridge pointing to the production-grade LocalDatabaseService & SyncEngine
class OfflineStorageService {
  static final OfflineStorageService _instance = OfflineStorageService._internal();
  factory OfflineStorageService() => _instance;
  OfflineStorageService._internal();

  final LocalDatabaseService _localDb = LocalDatabaseService();
  final SyncQueue _syncQueue = SyncQueue();

  Future<void> init() async {
    await _localDb.init();
  }

  /// Cache Animal profile locally in structured database
  Future<void> cacheAnimal(Map<String, dynamic> animalData) async {
    await _localDb.saveAnimalMap(animalData);
  }

  /// Retrieve cached Animal profile from structured database
  Map<String, dynamic>? getCachedAnimal(String identifier) {
    final animal = _localDb.getAnimalById(identifier);
    return animal?.toMap();
  }

  /// Save Treatment locally and queue mutation
  Future<void> saveTreatmentLocally(Map<String, dynamic> treatment) async {
    final t = Treatment.fromJson(treatment);
    final id = t.id ?? 'tr_${DateTime.now().millisecondsSinceEpoch}';
    t.id = id;
    await _localDb.saveTreatment(t, markLocalUpdate: true);

    final mutation = SyncMutation(
      id: 'mut_tr_$id',
      entityType: MutationEntityType.treatment,
      operation: MutationOperation.create,
      clientEntityId: id,
      payload: treatment,
      timestamp: DateTime.now(),
    );
    await _syncQueue.enqueue(mutation);

    if (Get.isRegistered<SyncEngine>()) {
      SyncEngine.to.notifyMutationAdded();
    }
  }

  /// Save Syndromic Disease Report locally and queue mutation
  Future<void> saveDiseaseReportLocally(Map<String, dynamic> reportData) async {
    final clientReportId = reportData['client_report_id'] ?? 'offline_${DateTime.now().millisecondsSinceEpoch}';
    reportData['client_report_id'] = clientReportId;
    reportData['is_synced'] = false;
    reportData['created_at'] = reportData['created_at'] ?? DateTime.now().toIso8601String();

    await _localDb.saveDiseaseReport(reportData, markLocalUpdate: true);

    final mutation = SyncMutation(
      id: 'mut_rep_$clientReportId',
      entityType: MutationEntityType.diseaseReport,
      operation: MutationOperation.create,
      clientEntityId: clientReportId,
      payload: reportData,
      timestamp: DateTime.now(),
    );
    await _syncQueue.enqueue(mutation);

    if (Get.isRegistered<SyncEngine>()) {
      SyncEngine.to.notifyMutationAdded();
    }
  }

  /// Save Vaccination Record locally and queue mutation
  Future<void> saveVaccinationLocally(Map<String, dynamic> vacData) async {
    final clientVacId = vacData['id'] ?? 'vac_${DateTime.now().millisecondsSinceEpoch}';
    vacData['id'] = clientVacId;
    vacData['is_synced'] = false;

    final vax = VaccinationRecord.fromJson(vacData);
    await _localDb.saveVaccination(vax, markLocalUpdate: true);

    final mutation = SyncMutation(
      id: 'mut_vac_$clientVacId',
      entityType: MutationEntityType.vaccination,
      operation: MutationOperation.create,
      clientEntityId: clientVacId,
      payload: vacData,
      timestamp: DateTime.now(),
    );
    await _syncQueue.enqueue(mutation);

    if (Get.isRegistered<SyncEngine>()) {
      SyncEngine.to.notifyMutationAdded();
    }
  }

  /// Synchronize all pending offline queues
  Future<void> syncOfflineData() async {
    if (Get.isRegistered<SyncEngine>()) {
      await SyncEngine.to.syncAll();
    }
  }

  /// Cache latest risk points for offline map viewing
  Future<void> cacheRiskPoints(List<Map<String, dynamic>> points) async {
    final parsed = points.map((p) => AnimalRiskPoint.fromJson(p)).toList();
    await _localDb.saveRiskPoints(parsed);
  }

  /// Retrieve cached risk points
  List<Map<String, dynamic>> getCachedRiskPoints() {
    return _localDb.getCachedRiskPoints().map((p) => p.toJson()).toList();
  }

  /// Retrieve cached vaccinations for an animal
  List<Map<String, dynamic>> getCachedVaccinations([String? animalId]) {
    return _localDb.getAllVaccinations(animalId: animalId).map((v) => v.toJson()).toList();
  }

  /// Retrieve cached disease reports for an animal
  List<Map<String, dynamic>> getCachedDiseaseReports([String? animalId]) {
    return _localDb.getAllDiseaseReports(animalId: animalId);
  }
}

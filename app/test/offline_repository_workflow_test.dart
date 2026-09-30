import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:farmshield/app/data/models/farm_models.dart';
import 'package:farmshield/app/data/providers/api_provider.dart';
import 'package:farmshield/app/data/repositories/farm_repository.dart';
import 'package:farmshield/app/data/services/local_database_service.dart';
import 'package:farmshield/app/data/sync/sync_mutation.dart';
import 'package:farmshield/app/data/sync/sync_queue.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late Directory tempDir;
  late LocalDatabaseService db;
  late FarmRepository repo;

  setUpAll(() async {
    tempDir = await Directory.systemTemp.createTemp('farmshield_repo_offline_test_');
    db = LocalDatabaseService();
    await db.init(customPath: tempDir.path);
    repo = FarmRepository(apiProvider: ApiProvider());
  });

  tearDownAll(() async {
    await db.closeForTesting();
    if (tempDir.existsSync()) {
      await tempDir.delete(recursive: true);
    }
  });

  setUp(() async {
    await db.clearAllDataForTesting();
    await SyncQueue().clearAll();
  });

  group('Offline-First Repository Workflow Tests', () {
    test('Offline Animal Registration persists immediately and queues mutation', () async {
      final newAnimal = Animal(
        id: 'offline-cow-101',
        animalCode: 'TAG-COW-101',
        species: 'cow',
        breed: 'Sahiwal',
        dob: DateTime(2022, 5, 20),
        sex: 'female',
        weightKg: 410.0,
        purpose: 'milk',
        healthStatus: 'healthy',
        qrToken: 'QR-COW-101',
      );

      // Register offline
      final registered = await repo.registerAnimal(newAnimal);
      expect(registered.id, 'offline-cow-101');

      // Verify immediate local availability with 0 network latency
      final animals = await repo.getAnimals();
      expect(animals.length, 1);
      expect(animals.first.id, 'offline-cow-101');
      expect(animals.first.breed, 'Sahiwal');

      // Verify persistent SyncQueue mutation was generated
      final queue = SyncQueue();
      expect(queue.pendingCount, 1);
      final eligible = queue.getEligibleMutations(DateTime.now());
      expect(eligible.length, 1);
      expect(eligible.first.entityType, MutationEntityType.animal);
      expect(eligible.first.operation, MutationOperation.create);
      expect(eligible.first.clientEntityId, 'offline-cow-101');
    });

    test('Offline Treatment Recording automatically computes withdrawal period and enqueues sync', () async {
      // 1. Seed a medicine with withdrawal rules
      final medicine = Medicine(
        id: 'med-tylosin',
        name: 'Tylosin Tartrate 20%',
        antimicrobialClass: 'Macrolide',
        rules: [
          RegulatoryRule(
            id: 'rule-tylosin-milk',
            medicineId: 'med-tylosin',
            product: 'milk',
            withdrawalDays: 5,
            source: 'FSSAI',
          ),
        ],
      );
      await db.saveMedicine(medicine);

      // 2. Register animal
      final animal = Animal(
        id: 'anim-treatment-target',
        animalCode: 'COW-TREAT-01',
        species: 'cow',
      );
      await repo.registerAnimal(animal);

      // 3. Record treatment while offline
      final startDate = DateTime(2026, 9, 30);
      final treatment = Treatment(
        id: 'treat-offline-001',
        animalId: 'anim-treatment-target',
        medicineId: 'med-tylosin',
        startDate: startDate,
        durationDays: 3,
        doseAmount: 10.0,
        doseUnit: 'mg/kg',
        productAffected: 'milk',
        indication: 'Bovine Respiratory Disease',
      );

      await repo.addTreatment(treatment);

      // 4. Verify treatment persisted locally
      final treatments = db.getAllTreatments(animalId: 'anim-treatment-target');
      expect(treatments.length, 1);
      expect(treatments.first.id, 'treat-offline-001');

      // 5. Verify withdrawal period was automatically calculated:
      // duration (3 days) + withdrawalDays (5 days) = 8 days clearance date
      final withdrawals = await repo.getWithdrawals();
      expect(withdrawals.isNotEmpty, isTrue);
      final activeWithdrawal = withdrawals.firstWhere((w) => w.animalId == 'anim-treatment-target');
      expect(activeWithdrawal.product, 'milk');
      expect(activeWithdrawal.indication, 'Bovine Respiratory Disease');

      final expectedClearance = startDate.add(const Duration(days: 3 + 5));
      expect(activeWithdrawal.endDate, expectedClearance);

      // 6. Verify sync queue has mutations for both animal and treatment
      final queue = SyncQueue();
      expect(queue.pendingCount, 2); // 1 animal + 1 treatment
    });

    test('Data survives application termination and restart simulation', () async {
      // 1. Write data
      final animal = Animal(
        id: 'restart-test-cow',
        animalCode: 'RESTART-COW',
        species: 'cow',
        healthStatus: 'healthy',
      );
      await repo.registerAnimal(animal);

      final queue = SyncQueue();
      expect(queue.pendingCount, 1);

      // 2. Simulate complete application termination (close boxes)
      await db.closeForTesting();

      // 3. Simulate cold boot (reopen boxes at same path without network)
      final restoredDb = LocalDatabaseService();
      await restoredDb.init(customPath: tempDir.path);

      // 4. Read immediately from local storage
      final restoredAnimals = restoredDb.getAllAnimals();
      expect(restoredAnimals.length, 1);
      expect(restoredAnimals.first.id, 'restart-test-cow');
      expect(restoredAnimals.first.animalCode, 'RESTART-COW');

      // 5. Check sync queue survived process restart intact
      final restoredQueue = SyncQueue();
      expect(restoredQueue.pendingCount, 1);
      final pendingList = restoredQueue.getAllPendingMutations();
      expect(pendingList.first.clientEntityId, 'restart-test-cow');
    });

    test('Offline QR code resolution retrieves cached animal without network', () async {
      final animal = Animal(
        id: 'qr-cow-101',
        animalCode: 'COW-QR-101',
        species: 'cow',
        breed: 'Gir',
        qrToken: 'QR-PASS-101',
        healthStatus: 'healthy',
      );
      await db.saveAnimal(animal);

      // Resolve by full verification URL
      final resolvedFromUrl = await repo.resolveAnimalByQr('https://farmshield.in/qr/QR-PASS-101');
      expect(resolvedFromUrl, isNotNull);
      expect(resolvedFromUrl!.id, 'qr-cow-101');
      expect(resolvedFromUrl.animalCode, 'COW-QR-101');

      // Resolve by direct token string
      final resolvedDirect = await repo.resolveAnimalByQr('QR-PASS-101');
      expect(resolvedDirect, isNotNull);
      expect(resolvedDirect!.id, 'qr-cow-101');
    });
  });
}

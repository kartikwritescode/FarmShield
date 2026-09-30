import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:farmshield/app/data/models/farm_models.dart';
import 'package:farmshield/app/data/services/local_database_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late Directory tempDir;
  late LocalDatabaseService db;

  setUpAll(() async {
    tempDir = await Directory.systemTemp.createTemp('farmshield_local_db_test_');
    db = LocalDatabaseService();
    await db.init(customPath: tempDir.path);
  });

  tearDownAll(() async {
    await db.closeForTesting();
    if (tempDir.existsSync()) {
      await tempDir.delete(recursive: true);
    }
  });

  setUp(() async {
    await db.clearAllDataForTesting();
  });

  group('LocalDatabaseService — Animals CRUD Tests', () {
    test('Saves, retrieves by ID, searches, and deletes animal records', () async {
      final animal = Animal(
        id: 'anim-101',
        animalCode: 'COW-101',
        species: 'cow',
        breed: 'Gir Purebred',
        dob: DateTime(2023, 1, 10),
        sex: 'female',
        weightKg: 385.0,
        purpose: 'milk',
        healthStatus: 'healthy',
        qrToken: 'QR-COW-101',
      );

      await db.saveAnimal(animal);

      // Verify single retrieve by primary ID
      final retrieved = db.getAnimalById('anim-101');
      expect(retrieved, isNotNull);
      expect(retrieved!.animalCode, 'COW-101');
      expect(retrieved.breed, 'Gir Purebred');
      expect(retrieved.weightKg, 385.0);

      // Verify retrieve by animalCode
      final byCode = db.getAnimalById('COW-101');
      expect(byCode, isNotNull);
      expect(byCode!.id, 'anim-101');

      // Verify retrieve by qrToken
      final byQr = db.getAnimalById('QR-COW-101');
      expect(byQr, isNotNull);
      expect(byQr!.id, 'anim-101');

      // Verify getAllAnimals
      final all = db.getAllAnimals();
      expect(all.length, 1);
      expect(all.first.id, 'anim-101');

      // Verify delete
      await db.deleteAnimalLocally('anim-101');
      expect(db.getAllAnimals(), isEmpty);
    });

    test('Batch save efficiently replaces/merges multiple animal records', () async {
      final list = [
        {'id': 'a-1', 'animal_code': 'COW-1', 'species': 'cow', 'health_status': 'healthy'},
        {'id': 'a-2', 'animal_code': 'COW-2', 'species': 'cow', 'health_status': 'critical'},
        {'id': 'a-3', 'animal_code': 'BUF-1', 'species': 'buffalo', 'health_status': 'healthy'},
      ];

      await db.saveAnimalsBatch(list);
      final all = db.getAllAnimals();
      expect(all.length, 3);
      expect(db.getAnimalById('a-2')?.healthStatus, 'critical');

      // Filter by species
      final buffaloes = db.getAllAnimals(species: 'buffalo');
      expect(buffaloes.length, 1);
      expect(buffaloes.first.id, 'a-3');
    });
  });

  group('LocalDatabaseService — Treatments & Withdrawals Persistence Tests', () {
    test('Persists treatments and queries them by animal ID', () async {
      final treat1 = Treatment(
        id: 't-1',
        animalId: 'anim-101',
        medicineId: 'med-1',
        startDate: DateTime(2026, 9, 20),
        endDate: DateTime(2026, 9, 25),
        doseAmount: 15.0,
        doseUnit: 'ml',
        route: 'Intramuscular',
        indication: 'Respiratory infection',
      );
      final treat2 = Treatment(
        id: 't-2',
        animalId: 'anim-102',
        medicineId: 'med-2',
        startDate: DateTime(2026, 9, 22),
        endDate: DateTime(2026, 9, 23),
        doseAmount: 10.0,
        doseUnit: 'ml',
        indication: 'Joint inflammation',
      );

      await db.saveTreatment(treat1);
      await db.saveTreatment(treat2);

      final forAnim101 = db.getAllTreatments(animalId: 'anim-101');
      expect(forAnim101.length, 1);
      expect(forAnim101.first.indication, 'Respiratory infection');

      final allTreatments = db.getAllTreatments();
      expect(allTreatments.length, 2);
    });

    test('Persists withdrawals and filters by animal ID', () async {
      final futureDate = DateTime.now().add(const Duration(days: 5));
      final pastDate = DateTime.now().subtract(const Duration(days: 2));

      final activeWithdrawal = Withdrawal(
        id: 'w-1',
        treatmentId: 't-1',
        animalId: 'anim-101',
        product: 'milk',
        startDate: DateTime.now().subtract(const Duration(days: 2)),
        endDate: futureDate,
        status: 'active',
        medicineName: 'Ceftiofur Sodium',
      );

      final completedWithdrawal = Withdrawal(
        id: 'w-2',
        treatmentId: 't-2',
        animalId: 'anim-102',
        product: 'meat',
        startDate: DateTime.now().subtract(const Duration(days: 10)),
        endDate: pastDate,
        status: 'completed',
        medicineName: 'Enrofloxacin',
      );

      await db.saveWithdrawal(activeWithdrawal);
      await db.saveWithdrawal(completedWithdrawal);

      final allWithdrawals = db.getAllWithdrawals();
      expect(allWithdrawals.length, 2);

      final forAnim101 = db.getAllWithdrawals(animalId: 'anim-101');
      expect(forAnim101.length, 1);
      expect(forAnim101.first.id, 'w-1');
      expect(forAnim101.first.medicineName, 'Ceftiofur Sodium');
    });
  });

  group('LocalDatabaseService — Medicines & Regulatory Rules Tests', () {
    test('Stores and indexes medicines and regulatory MRL rules locally', () async {
      final medicines = [
        {
          'id': 'med-1',
          'name': 'Oxytetracycline 200mg/ml',
          'antimicrobial_class': 'Tetracycline',
        },
        {
          'id': 'med-2',
          'name': 'Ivermectin 1%',
          'antimicrobial_class': 'Macrocyclic lactone',
        },
      ];

      final rules = [
        {
          'id': 'rule-1',
          'medicine_id': 'med-1',
          'source': 'FSSAI Food Safety Standard',
          'product': 'milk',
          'withdrawal_days': 4,
          'mrl': 100.0,
        },
        {
          'id': 'rule-2',
          'medicine_id': 'med-1',
          'source': 'Codex Alimentarius',
          'product': 'meat',
          'withdrawal_days': 14,
          'mrl': 200.0,
        },
      ];

      await db.saveMedicinesBatch(medicines);
      await db.saveRegulatoryRulesBatch(rules);

      final fetchedMeds = db.getAllMedicines();
      expect(fetchedMeds.length, 2);

      final med1 = fetchedMeds.firstWhere((m) => m.id == 'med-1');
      expect(med1.name, 'Oxytetracycline 200mg/ml');
      expect(med1.antimicrobialClass, 'Tetracycline');

      final medRules = db.getRulesForMedicine('med-1');
      expect(medRules.length, 2);
      expect(medRules.any((r) => r.source == 'FSSAI Food Safety Standard'), isTrue);
      expect(medRules.firstWhere((r) => r.source == 'FSSAI Food Safety Standard').withdrawalDays, 4);
    });
  });

  group('LocalDatabaseService — Reactive Watcher Streams Tests', () {
    test('watchAnimals emits events immediately when data changes', () async {
      final stream = db.watchAnimals();
      bool emitted = false;

      final subscription = stream.listen((event) {
        emitted = true;
      });

      await db.saveAnimalMap({
        'id': 'stream-anim-1',
        'animal_code': 'STREAM-01',
        'species': 'cow',
      });

      await Future.delayed(const Duration(milliseconds: 50));
      expect(emitted, isTrue);

      await subscription.cancel();
    });

    test('watchWithdrawals emits events when withdrawal records change', () async {
      final stream = db.watchWithdrawals();
      bool emitted = false;

      final subscription = stream.listen((event) {
        emitted = true;
      });

      await db.saveWithdrawal(Withdrawal(
        id: 'stream-with-1',
        treatmentId: 't-s1',
        animalId: 'a-s1',
        product: 'milk',
        startDate: DateTime.now(),
        endDate: DateTime.now().add(const Duration(days: 3)),
        status: 'active',
      ));

      await Future.delayed(const Duration(milliseconds: 50));
      expect(emitted, isTrue);

      await subscription.cancel();
    });
  });

  group('LocalDatabaseService — Diagnostics & Sync Metadata Tests', () {
    test('Accurately tracks sync timestamps and collection counts', () async {
      final now = DateTime(2026, 9, 30, 9, 45, 0);
      await db.setLastSyncTime('animals', now);

      final retrievedTime = db.getLastSyncTime('animals');
      expect(retrievedTime, now);

      await db.saveAnimalMap({'id': 'stat-1', 'animal_code': 'STAT-01'});
      await db.saveTreatment(Treatment(id: 'stat-t-1', animalId: 'stat-1'));

      final stats = db.getDatabaseStats();
      expect(stats['animals'], 1);
      expect(stats['treatments'], 1);
      expect(stats['withdrawals'], 0);
    });
  });
}

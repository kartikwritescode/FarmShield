import 'package:flutter_test/flutter_test.dart';
import 'package:farmshield/app/data/models/farm_models.dart';
import 'package:farmshield/app/data/sync/conflict_resolver.dart';

void main() {
  group('ConflictResolver — Animal Conflict Resolution Tests', () {
    test('Remote wins when remote timestamp is strictly newer and no health critical status', () {
      final local = {
        'id': 'anim-101',
        'animal_code': 'COW-101',
        'species': 'cow',
        'breed': 'Jersey Old',
        'weight': 350.0,
        'health_status': 'healthy',
        'updated_at': '2026-09-01T10:00:00.000Z',
      };

      final remote = {
        'id': 'anim-101',
        'animal_code': 'COW-101',
        'species': 'cow',
        'breed': 'Jersey Purebred',
        'weight': 380.0,
        'health_status': 'healthy',
        'updated_at': '2026-09-02T10:00:00.000Z',
      };

      final resolved = ConflictResolver.resolveAnimalConflict(local: local, remote: remote);

      expect(resolved['breed'], 'Jersey Purebred');
      expect(resolved['weight'], 380.0);
      expect(resolved['health_status'], 'healthy');
    });

    test('Local wins when local timestamp is newer', () {
      final local = {
        'id': 'anim-102',
        'animal_code': 'COW-102',
        'species': 'cow',
        'breed': 'Gir Purebred',
        'weight': 420.5,
        'health_status': 'healthy',
        'local_updated_at': '2026-09-05T12:00:00.000Z',
      };

      final remote = {
        'id': 'anim-102',
        'animal_code': 'COW-102',
        'species': 'cow',
        'breed': 'Gir',
        'weight': 400.0,
        'health_status': 'healthy',
        'updated_at': '2026-09-01T10:00:00.000Z',
      };

      final resolved = ConflictResolver.resolveAnimalConflict(local: local, remote: remote);

      expect(resolved['weight'], 420.5);
      expect(resolved['breed'], 'Gir Purebred');
    });

    test('Health safety precedence: local critical status overrides remote healthy status even if remote is newer', () {
      final local = {
        'id': 'anim-103',
        'animal_code': 'COW-103',
        'species': 'cow',
        'health_status': 'critical',
        'updated_at': '2026-09-01T10:00:00.000Z',
      };

      final remote = {
        'id': 'anim-103',
        'animal_code': 'COW-103',
        'species': 'cow',
        'health_status': 'healthy',
        'updated_at': '2026-09-03T10:00:00.000Z', // Remote is 2 days newer
      };

      final resolved = ConflictResolver.resolveAnimalConflict(local: local, remote: remote);

      // CRITICAL PRECEDENCE: Disease flag MUST NOT be erased by stale/naive remote sync
      expect(resolved['health_status'], 'critical');
    });

    test('Health safety precedence: remote affected status overrides local healthy status', () {
      final local = {
        'id': 'anim-104',
        'animal_code': 'BUF-104',
        'health_status': 'healthy',
        'updated_at': '2026-09-04T10:00:00.000Z',
      };

      final remote = {
        'id': 'anim-104',
        'animal_code': 'BUF-104',
        'health_status': 'affected',
        'updated_at': '2026-09-01T10:00:00.000Z',
      };

      final resolved = ConflictResolver.resolveAnimalConflict(local: local, remote: remote);

      expect(resolved['health_status'], 'affected');
    });

    test('Health safety precedence: under_observation overrides healthy', () {
      final local = {
        'id': 'anim-105',
        'animal_code': 'COW-105',
        'health_status': 'under_observation',
        'updated_at': '2026-09-01T10:00:00.000Z',
      };

      final remote = {
        'id': 'anim-105',
        'animal_code': 'COW-105',
        'health_status': 'healthy',
        'updated_at': '2026-09-02T10:00:00.000Z',
      };

      final resolved = ConflictResolver.resolveAnimalConflict(local: local, remote: remote);

      expect(resolved['health_status'], 'under_observation');
    });
  });

  group('ConflictResolver — Withdrawal Clearance Safety Merge Tests', () {
    test('Resolves withdrawal conflict by selecting maximum clearance end-date', () {
      final baseStart = DateTime(2026, 9, 1);
      final earlyEnd = DateTime(2026, 9, 10);
      final extendedEnd = DateTime(2026, 9, 18); // 8 days longer withdrawal

      final localWithdrawal = Withdrawal(
        id: 'with-001',
        treatmentId: 'treat-001',
        animalId: 'anim-101',
        product: 'milk',
        startDate: baseStart,
        endDate: extendedEnd,
        status: 'active',
        medicineName: 'Oxytetracycline 20%',
      );

      final remoteWithdrawal = Withdrawal(
        id: 'with-001',
        treatmentId: 'treat-001',
        animalId: 'anim-101',
        product: 'milk',
        startDate: baseStart,
        endDate: earlyEnd,
        status: 'completed',
        medicineName: 'Oxytetracycline 20%',
      );

      final resolved = ConflictResolver.resolveWithdrawalConflict(
        local: localWithdrawal,
        remote: remoteWithdrawal,
      );

      // Must take the extended withdrawal date to prevent contaminated milk in supply chain
      expect(resolved.endDate, extendedEnd);
      expect(resolved.startDate, baseStart);
      expect(resolved.medicineName, 'Oxytetracycline 20%');
    });

    test('Takes remote end-date when remote requires longer withdrawal period', () {
      final localStart = DateTime(2026, 9, 2);
      final remoteStart = DateTime(2026, 9, 1); // Started 1 day earlier
      final localEnd = DateTime(2026, 9, 12);
      final remoteEnd = DateTime(2026, 9, 22); // Regulatory authority extended withdrawal

      final localWithdrawal = Withdrawal(
        id: 'with-002',
        treatmentId: 'treat-002',
        animalId: 'anim-102',
        product: 'meat',
        startDate: localStart,
        endDate: localEnd,
        status: 'active',
      );

      final remoteWithdrawal = Withdrawal(
        id: 'with-002',
        treatmentId: 'treat-002',
        animalId: 'anim-102',
        product: 'meat',
        startDate: remoteStart,
        endDate: remoteEnd,
        status: 'active',
      );

      final resolved = ConflictResolver.resolveWithdrawalConflict(
        local: localWithdrawal,
        remote: remoteWithdrawal,
      );

      expect(resolved.startDate, remoteStart);
      expect(resolved.endDate, remoteEnd);
    });
  });
}

import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:farmshield/app/data/services/local_database_service.dart';
import 'package:farmshield/app/data/sync/sync_mutation.dart';
import 'package:farmshield/app/data/sync/sync_queue.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late Directory tempDir;

  setUpAll(() async {
    tempDir = await Directory.systemTemp.createTemp('farmshield_sync_test_');
    await LocalDatabaseService().init(customPath: tempDir.path);
  });

  tearDownAll(() async {
    await LocalDatabaseService().closeForTesting();
    if (tempDir.existsSync()) {
      await tempDir.delete(recursive: true);
    }
  });

  setUp(() async {
    await SyncQueue().clearAll();
  });

  group('SyncMutation — Model & Backoff Tests', () {
    test('Calculates exponential backoff correctly with upper ceiling', () {
      final baseMut = SyncMutation(
        id: 'mut-1',
        entityType: MutationEntityType.animal,
        operation: MutationOperation.create,
        clientEntityId: 'anim-1',
        payload: {'name': 'Test Cow'},
        timestamp: DateTime.now(),
      );

      expect(baseMut.backoffSeconds, 2); // 2 * 2^0 = 2

      baseMut.retryCount = 1;
      expect(baseMut.backoffSeconds, 4); // 2 * 2^1 = 4

      baseMut.retryCount = 2;
      expect(baseMut.backoffSeconds, 8); // 2 * 2^2 = 8

      baseMut.retryCount = 3;
      expect(baseMut.backoffSeconds, 16); // 2 * 2^3 = 16

      baseMut.retryCount = 4;
      expect(baseMut.backoffSeconds, 32); // 2 * 2^4 = 32

      baseMut.retryCount = 5;
      expect(baseMut.backoffSeconds, 60); // Capped at 60

      baseMut.retryCount = 10;
      expect(baseMut.backoffSeconds, 60); // Capped at 60
    });

    test('isReadyForRetry respects backoff duration and status', () {
      final now = DateTime(2026, 9, 30, 10, 0, 0);

      final mut = SyncMutation(
        id: 'mut-2',
        entityType: MutationEntityType.treatment,
        operation: MutationOperation.create,
        clientEntityId: 'treat-1',
        payload: {'dosage': '10ml'},
        timestamp: now.subtract(const Duration(minutes: 5)),
        status: MutationStatus.pending,
      );

      // Never attempted yet
      expect(mut.isReadyForRetry(now), isTrue);

      // Attempted 1 second ago with retryCount 1 (needs 4s)
      mut.status = MutationStatus.failed;
      mut.retryCount = 1;
      mut.lastAttemptAt = now.subtract(const Duration(seconds: 1));
      expect(mut.isReadyForRetry(now), isFalse);

      // Attempted 5 seconds ago with retryCount 1 (needs 4s) -> ready!
      mut.lastAttemptAt = now.subtract(const Duration(seconds: 5));
      expect(mut.isReadyForRetry(now), isTrue);

      // Completed mutations should never be ready for retry
      mut.status = MutationStatus.completed;
      expect(mut.isReadyForRetry(now), isFalse);
    });

    test('SyncMutation correctly serializes and deserializes', () {
      final original = SyncMutation(
        id: 'mut-test-123',
        entityType: MutationEntityType.withdrawal,
        operation: MutationOperation.update,
        clientEntityId: 'with-456',
        payload: {'status': 'active', 'days': 7},
        timestamp: DateTime(2026, 9, 30, 8, 30),
        retryCount: 2,
        lastAttemptAt: DateTime(2026, 9, 30, 8, 35),
        lastError: 'HTTP 503 Service Unavailable',
        status: MutationStatus.failed,
      );

      final json = original.toJson();
      final restored = SyncMutation.fromJson(json);

      expect(restored.id, original.id);
      expect(restored.entityType, MutationEntityType.withdrawal);
      expect(restored.operation, MutationOperation.update);
      expect(restored.clientEntityId, 'with-456');
      expect(restored.payload['days'], 7);
      expect(restored.retryCount, 2);
      expect(restored.lastError, 'HTTP 503 Service Unavailable');
      expect(restored.status, MutationStatus.failed);
    });
  });

  group('SyncQueue — Persistent Queue & FIFO Lifecycle Tests', () {
    test('Enqueues mutations and preserves strict FIFO ordering', () async {
      final queue = SyncQueue();

      final t1 = DateTime(2026, 9, 30, 9, 0, 0);
      final t2 = DateTime(2026, 9, 30, 9, 1, 0);
      final t3 = DateTime(2026, 9, 30, 9, 2, 0);

      // Enqueue out of order
      await queue.enqueue(SyncMutation(
        id: 'mut-3',
        entityType: MutationEntityType.diseaseReport,
        operation: MutationOperation.create,
        clientEntityId: 'rep-3',
        payload: {'symptoms': 'cough'},
        timestamp: t3,
      ));

      await queue.enqueue(SyncMutation(
        id: 'mut-1',
        entityType: MutationEntityType.animal,
        operation: MutationOperation.create,
        clientEntityId: 'anim-1',
        payload: {'code': 'COW-1'},
        timestamp: t1,
      ));

      await queue.enqueue(SyncMutation(
        id: 'mut-2',
        entityType: MutationEntityType.treatment,
        operation: MutationOperation.create,
        clientEntityId: 'treat-2',
        payload: {'medicine': 'penicillin'},
        timestamp: t2,
      ));

      expect(queue.pendingCount, 3);

      final eligible = queue.getEligibleMutations(DateTime(2026, 9, 30, 10, 0, 0));
      expect(eligible.length, 3);
      expect(eligible[0].id, 'mut-1'); // Earliest timestamp first
      expect(eligible[1].id, 'mut-2');
      expect(eligible[2].id, 'mut-3'); // Latest timestamp last
    });

    test('Transitions status through inFlight, failed with backoff, and success pruning', () async {
      final queue = SyncQueue();

      final mut = SyncMutation(
        id: 'mut-flow',
        entityType: MutationEntityType.animal,
        operation: MutationOperation.create,
        clientEntityId: 'anim-flow',
        payload: {'animal_code': 'BUF-99'},
        timestamp: DateTime(2026, 9, 30, 9, 0, 0),
      );

      await queue.enqueue(mut);

      // Mark in-flight
      await queue.markInFlight(mut.id);
      var pendingList = queue.getAllPendingMutations();
      expect(pendingList.first.status, MutationStatus.inFlight);
      expect(pendingList.first.lastAttemptAt, isNotNull);

      // Mark failed with network error
      await queue.markFailed(mut.id, 'Connection timeout');
      pendingList = queue.getAllPendingMutations();
      expect(pendingList.first.status, MutationStatus.failed);
      expect(pendingList.first.retryCount, 1);
      expect(pendingList.first.lastError, 'Connection timeout');

      // Mark success: must prune item from the queue
      await queue.markSuccess(mut.id);
      expect(queue.pendingCount, 0);
      expect(queue.getAllPendingMutations(), isEmpty);
    });

    test('Exhausted retry mutations are ignored by getEligibleMutations (poison-pill prevention)', () async {
      final queue = SyncQueue();

      final mut = SyncMutation(
        id: 'mut-poison',
        entityType: MutationEntityType.animal,
        operation: MutationOperation.create,
        clientEntityId: 'anim-bad',
        payload: {'invalid': true},
        timestamp: DateTime(2026, 9, 30, 9, 0, 0),
        retryCount: SyncQueue.maxRetries, // Already reached 5
        status: MutationStatus.failed,
      );

      await queue.enqueue(mut);

      final eligible = queue.getEligibleMutations(DateTime(2026, 9, 30, 10, 0, 0));
      // Poison-pill mutation is retained for audit but skipped from processing loop
      expect(eligible, isEmpty);
      expect(queue.pendingCount, 1);

      // Resetting failed mutations restores it back to eligible with 0 retries
      await queue.resetFailedMutations();
      final restoredEligible = queue.getEligibleMutations(DateTime(2026, 9, 30, 10, 0, 0));
      expect(restoredEligible.length, 1);
      expect(restoredEligible.first.retryCount, 0);
      expect(restoredEligible.first.status, MutationStatus.pending);
    });
  });
}

import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:hive/hive.dart';
import '../services/local_database_service.dart';
import 'sync_mutation.dart';

class SyncQueue {
  static final SyncQueue _instance = SyncQueue._internal();
  factory SyncQueue() => _instance;
  SyncQueue._internal();

  Box get _box => LocalDatabaseService().syncQueueBox;

  static const int maxRetries = 5;

  /// Enqueue a mutation to the persistent Hive storage
  Future<void> enqueue(SyncMutation mutation) async {
    await _box.put(mutation.id, mutation.toJson());
    debugPrint('[SYNC_QUEUE] Enqueued mutation: ${mutation.id} (${mutation.entityType.name} - ${mutation.operation.name})');
  }

  /// Retrieve all pending mutations eligible for processing in FIFO order
  List<SyncMutation> getEligibleMutations(DateTime now) {
    final list = <SyncMutation>[];
    for (var val in _box.values) {
      if (val is Map) {
        try {
          final mut = SyncMutation.fromJson(Map<String, dynamic>.from(val));
          if (mut.status == MutationStatus.completed) continue;
          if (mut.retryCount >= maxRetries) continue; // Poisoned pill / exhausted
          if (mut.isReadyForRetry(now)) {
            list.add(mut);
          }
        } catch (e) {
          debugPrint('[SYNC_QUEUE] Parse mutation error: $e');
        }
      }
    }
    // Strict FIFO order by creation timestamp
    list.sort((a, b) => a.timestamp.compareTo(b.timestamp));
    return list;
  }

  /// Retrieve all mutations currently pending or failed
  List<SyncMutation> getAllPendingMutations() {
    final list = <SyncMutation>[];
    for (var val in _box.values) {
      if (val is Map) {
        try {
          final mut = SyncMutation.fromJson(Map<String, dynamic>.from(val));
          if (mut.status != MutationStatus.completed) {
            list.add(mut);
          }
        } catch (_) {}
      }
    }
    list.sort((a, b) => a.timestamp.compareTo(b.timestamp));
    return list;
  }

  int get pendingCount {
    int count = 0;
    for (var val in _box.values) {
      if (val is Map) {
        if (val['status'] != MutationStatus.completed.name) {
          count++;
        }
      }
    }
    return count;
  }

  Future<void> markInFlight(String mutationId) async {
    final existing = _box.get(mutationId);
    if (existing is Map) {
      final map = Map<String, dynamic>.from(existing);
      map['status'] = MutationStatus.inFlight.name;
      map['lastAttemptAt'] = DateTime.now().toIso8601String();
      await _box.put(mutationId, map);
    }
  }

  Future<void> markSuccess(String mutationId) async {
    // Delete immediately on success to maintain clean database and idempotency
    await _box.delete(mutationId);
    debugPrint('[SYNC_QUEUE] Successfully completed and pruned mutation: $mutationId');
  }

  Future<void> markFailed(String mutationId, String errorMessage) async {
    final existing = _box.get(mutationId);
    if (existing is Map) {
      final map = Map<String, dynamic>.from(existing);
      final currentRetries = int.tryParse(map['retryCount']?.toString() ?? '0') ?? 0;
      map['status'] = MutationStatus.failed.name;
      map['retryCount'] = currentRetries + 1;
      map['lastAttemptAt'] = DateTime.now().toIso8601String();
      map['lastError'] = errorMessage;
      await _box.put(mutationId, map);
      debugPrint('[SYNC_QUEUE] Marked mutation $mutationId failed (retry #${currentRetries + 1}): $errorMessage');
    }
  }

  Future<void> resetFailedMutations() async {
    for (var key in _box.keys) {
      final item = _box.get(key);
      if (item is Map) {
        final map = Map<String, dynamic>.from(item);
        if (map['status'] == MutationStatus.failed.name) {
          map['status'] = MutationStatus.pending.name;
          map['retryCount'] = 0;
          await _box.put(key, map);
        }
      }
    }
  }

  Stream<BoxEvent> watch() => _box.watch();

  Future<void> clearAll() async {
    await _box.clear();
  }
}

import 'dart:convert';

enum MutationEntityType {
  animal,
  treatment,
  withdrawal,
  diseaseReport,
  vaccination,
  medicine,
  labResult,
  userProfile,
  unknown,
}

enum MutationOperation {
  create,
  update,
  delete,
}

enum MutationStatus {
  pending,
  inFlight,
  failed,
  completed,
}

class SyncMutation {
  final String id;
  final MutationEntityType entityType;
  final MutationOperation operation;
  final String clientEntityId;
  final Map<String, dynamic> payload;
  final DateTime timestamp;
  int retryCount;
  DateTime? lastAttemptAt;
  String? lastError;
  MutationStatus status;

  SyncMutation({
    required this.id,
    required this.entityType,
    required this.operation,
    required this.clientEntityId,
    required this.payload,
    required this.timestamp,
    this.retryCount = 0,
    this.lastAttemptAt,
    this.lastError,
    this.status = MutationStatus.pending,
  });

  /// Calculates exponential backoff in seconds (2s, 4s, 8s, 16s, 32s, max 60s)
  int get backoffSeconds {
    final s = 2 * (1 << retryCount);
    return s > 60 ? 60 : s;
  }

  bool isReadyForRetry(DateTime now) {
    if (status != MutationStatus.failed && status != MutationStatus.pending) return false;
    if (lastAttemptAt == null) return true;
    final diff = now.difference(lastAttemptAt!).inSeconds;
    return diff >= backoffSeconds;
  }

  factory SyncMutation.fromJson(Map<String, dynamic> json) {
    MutationEntityType type = MutationEntityType.unknown;
    final typeStr = json['entityType']?.toString().toLowerCase();
    for (var val in MutationEntityType.values) {
      if (val.name.toLowerCase() == typeStr) {
        type = val;
        break;
      }
    }

    MutationOperation op = MutationOperation.create;
    final opStr = json['operation']?.toString().toLowerCase();
    for (var val in MutationOperation.values) {
      if (val.name.toLowerCase() == opStr) {
        op = val;
        break;
      }
    }

    MutationStatus st = MutationStatus.pending;
    final stStr = json['status']?.toString().toLowerCase();
    for (var val in MutationStatus.values) {
      if (val.name.toLowerCase() == stStr) {
        st = val;
        break;
      }
    }

    Map<String, dynamic> pLoad = {};
    if (json['payload'] is Map) {
      pLoad = Map<String, dynamic>.from(json['payload']);
    } else if (json['payload'] is String) {
      try {
        pLoad = Map<String, dynamic>.from(jsonDecode(json['payload']));
      } catch (_) {}
    }

    return SyncMutation(
      id: json['id']?.toString() ?? 'mut_${DateTime.now().millisecondsSinceEpoch}',
      entityType: type,
      operation: op,
      clientEntityId: json['clientEntityId']?.toString() ?? '',
      payload: pLoad,
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'].toString()) ?? DateTime.now()
          : DateTime.now(),
      retryCount: int.tryParse(json['retryCount']?.toString() ?? '0') ?? 0,
      lastAttemptAt: json['lastAttemptAt'] != null
          ? DateTime.tryParse(json['lastAttemptAt'].toString())
          : null,
      lastError: json['lastError']?.toString(),
      status: st,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'entityType': entityType.name,
        'operation': operation.name,
        'clientEntityId': clientEntityId,
        'payload': payload,
        'timestamp': timestamp.toIso8601String(),
        'retryCount': retryCount,
        'lastAttemptAt': lastAttemptAt?.toIso8601String(),
        'lastError': lastError,
        'status': status.name,
      };
}

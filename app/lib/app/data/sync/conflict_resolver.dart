import '../models/farm_models.dart';

/// Explicit Conflict Resolution Strategies for SkillTwin / FarmShield
///
/// 1. ANIMALS (Field-Level Merge + Health-Safety Precedence)
///    - Non-conflicting fields are merged together.
///    - For conflicting fields: Last-Write-Wins based on timestamps.
///    - CRITICAL SAFETY RULE: If either side marks health status as 'critical' or 'affected',
///      that critical status takes precedence over 'healthy' to avoid hiding disease outbreaks.
///
/// 2. TREATMENTS (Append-Only Event Sourcing)
///    - Treatments are immutable clinical records.
///    - Identified idempotently by UUID or client_id. Never deleted or rolled back by sync.
///
/// 3. WITHDRAWALS (Safety-Authoritative Maximum Duration Merge)
///    - For MRL compliance, the active withdrawal clearance date is ALWAYS set to
///      the maximum end-date (max(local, remote)) to prevent premature commercial milk/meat sales.
///
/// 4. VACCINATIONS & DISEASE REPORTS (Append-Only Events)
///    - Field observations and immunization logs are strictly appended with client idempotency keys.
///
/// 5. REGULATORY RULES & MRL THRESHOLDS (Server-Authoritative)
///    - National standards (FSSAI/Codex Alimentarius) take absolute precedence over local drafts.
class ConflictResolver {
  /// Resolves conflicts between a local Animal record and a remote Animal record
  static Map<String, dynamic> resolveAnimalConflict({
    required Map<String, dynamic> local,
    required Map<String, dynamic> remote,
  }) {
    final merged = Map<String, dynamic>.from(remote);

    final localUpdatedStr = local['local_updated_at'] ?? local['updated_at'];
    final remoteUpdatedStr = remote['updated_at'] ?? remote['created_at'];

    final localTime = DateTime.tryParse(localUpdatedStr?.toString() ?? '') ?? DateTime(1970);
    final remoteTime = DateTime.tryParse(remoteUpdatedStr?.toString() ?? '') ?? DateTime(1970);

    final bool localIsNewer = localTime.isAfter(remoteTime);

    // If local is newer, preserve locally modified fields
    if (localIsNewer) {
      for (final key in local.keys) {
        if (key == 'sync_status' || key == 'local_updated_at') continue;
        if (local[key] != null) {
          merged[key] = local[key];
        }
      }
    }

    // Safety-critical check: Health status quarantine precedence
    final localStatus = (local['health_status'] ?? '').toString().toLowerCase();
    final remoteStatus = (remote['health_status'] ?? '').toString().toLowerCase();

    if (localStatus == 'critical' || remoteStatus == 'critical') {
      merged['health_status'] = 'critical';
    } else if (localStatus == 'affected' || remoteStatus == 'affected') {
      merged['health_status'] = 'affected';
    } else if (localStatus == 'under_observation' || remoteStatus == 'under_observation') {
      merged['health_status'] = 'under_observation';
    }

    return merged;
  }

  /// Resolves conflicts between withdrawal records ensuring zero-risk MRL safety
  static Withdrawal resolveWithdrawalConflict({
    required Withdrawal local,
    required Withdrawal remote,
  }) {
    // Always choose the latest clearance date to guarantee food safety
    final maxEndDate = local.endDate.isAfter(remote.endDate) ? local.endDate : remote.endDate;
    final minStartDate = local.startDate.isBefore(remote.startDate) ? local.startDate : remote.startDate;

    final String status = maxEndDate.isAfter(DateTime.now()) ? 'active' : 'completed';

    return Withdrawal(
      id: remote.id.isNotEmpty ? remote.id : local.id,
      treatmentId: remote.treatmentId.isNotEmpty ? remote.treatmentId : local.treatmentId,
      animalId: remote.animalId.isNotEmpty ? remote.animalId : local.animalId,
      product: local.product.isNotEmpty ? local.product : remote.product,
      startDate: minStartDate,
      endDate: maxEndDate,
      status: status,
      animal: local.animal ?? remote.animal,
      medicineName: local.medicineName ?? remote.medicineName,
      indication: local.indication ?? remote.indication,
      dosage: local.dosage ?? remote.dosage,
    );
  }
}

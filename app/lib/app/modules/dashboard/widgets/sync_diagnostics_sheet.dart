import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../data/services/local_database_service.dart';
import '../../../data/services/network_connectivity_service.dart';
import '../../../data/sync/sync_engine.dart';
import '../../../data/sync/sync_queue.dart';

class SyncDiagnosticsSheet extends StatelessWidget {
  const SyncDiagnosticsSheet({super.key});

  static void show() {
    Get.bottomSheet(
      const SyncDiagnosticsSheet(),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  @override
  Widget build(BuildContext context) {
    final syncEngine = SyncEngine.to;
    final connectivity = NetworkConnectivityService.to;
    final localDb = LocalDatabaseService();
    final queue = SyncQueue();

    return Container(
      constraints: BoxConstraints(maxHeight: Get.height * 0.85),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppSpacing.radiusXl)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 6),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.xl, AppSpacing.sm, AppSpacing.lg, AppSpacing.md),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primarySoft,
                        borderRadius: AppSpacing.roundedSm,
                      ),
                      child: const Icon(Icons.sync_alt_rounded, color: AppColors.primary, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Sync Engine & Offline Monitor', style: AppTypography.titleMedium),
                        Text('Local-First Persistence Diagnostics', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)),
                      ],
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Scrollable diagnostics
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Network & Reachability Card
                  _buildSectionTitle('Network & Reachability', Icons.wifi_rounded),
                  const SizedBox(height: 8),
                  Obx(() {
                    final isOnline = connectivity.isOnline.value;
                    final state = connectivity.networkState.value;
                    final lastCheck = connectivity.lastCheckedAt.value;

                    return Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: isOnline ? AppColors.success.withValues(alpha: 0.05) : AppColors.danger.withValues(alpha: 0.05),
                        borderRadius: AppSpacing.roundedMd,
                        border: Border.all(color: isOnline ? AppColors.success.withValues(alpha: 0.25) : AppColors.danger.withValues(alpha: 0.25)),
                      ),
                      child: Column(
                        children: [
                          _buildDiagRow(
                            'Network Status',
                            isOnline ? 'Online (Backend Reachable)' : (state == NetworkState.unreachable ? 'Unreachable (Captive/DNS)' : 'Offline (No Connection)'),
                            color: isOnline ? AppColors.success : AppColors.danger,
                            isBold: true,
                          ),
                          const Divider(height: 12),
                          _buildDiagRow(
                            'Last Reachability Check',
                            lastCheck != null ? DateFormat('HH:mm:ss').format(lastCheck) : 'Just now',
                          ),
                        ],
                      ),
                    );
                  }),
                  const SizedBox(height: AppSpacing.lg),

                  // Synchronization Status Card
                  _buildSectionTitle('Synchronization Engine', Icons.cloud_sync_rounded),
                  const SizedBox(height: 8),
                  Obx(() {
                    final status = syncEngine.syncStatus.value;
                    final pending = syncEngine.pendingMutationsCount.value;
                    final lastSync = syncEngine.lastSuccessfulSync.value;
                    final lastError = syncEngine.lastSyncError.value;

                    return Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceSubtle,
                        borderRadius: AppSpacing.roundedMd,
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        children: [
                          _buildDiagRow('Engine State', status.name.toUpperCase(), isBold: true),
                          const Divider(height: 12),
                          _buildDiagRow('Pending Queue Items', '$pending item(s)'),
                          const Divider(height: 12),
                          _buildDiagRow(
                            'Last Successful Sync',
                            lastSync != null ? DateFormat('dd MMM yyyy, HH:mm:ss').format(lastSync) : 'Never synced',
                          ),
                          if (lastError.isNotEmpty) ...[
                            const Divider(height: 12),
                            _buildDiagRow('Last Error', lastError, color: AppColors.danger),
                          ],
                        ],
                      ),
                    );
                  }),
                  const SizedBox(height: AppSpacing.lg),

                  // Local Database Cache Counts
                  _buildSectionTitle('Local Database Records', Icons.storage_rounded),
                  const SizedBox(height: 8),
                  Builder(builder: (context) {
                    final stats = localDb.getDatabaseStats();
                    return Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceSubtle,
                        borderRadius: AppSpacing.roundedMd,
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Wrap(
                        spacing: 12,
                        runSpacing: 10,
                        children: stats.entries.map((e) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: AppSpacing.roundedSm,
                              border: Border.all(color: AppColors.borderLight),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  '${e.key}: ',
                                  style: GoogleFonts.poppins(fontSize: 11, color: AppColors.textSecondary),
                                ),
                                Text(
                                  '${e.value}',
                                  style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    );
                  }),
                  const SizedBox(height: AppSpacing.lg),

                  // Pending Queue Inspection
                  _buildSectionTitle('Pending Mutation Queue', Icons.queue_rounded),
                  const SizedBox(height: 8),
                  Builder(builder: (context) {
                    final pending = queue.getAllPendingMutations();
                    if (pending.isEmpty) {
                      return Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.05),
                          borderRadius: AppSpacing.roundedMd,
                          border: Border.all(color: AppColors.success.withValues(alpha: 0.2)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle_outline_rounded, color: AppColors.success, size: 18),
                            const SizedBox(width: 8),
                            Text(
                              'All offline changes are fully synchronized.',
                              style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textPrimary),
                            ),
                          ],
                        ),
                      );
                    }

                    return Column(
                      children: pending.map((m) {
                        return Container(
                          margin: const EdgeInsets.only(bottom: 6),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceSubtle,
                            borderRadius: AppSpacing.roundedSm,
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.primary,
                                  borderRadius: AppSpacing.roundedXs,
                                ),
                                child: Text(
                                  m.entityType.name.toUpperCase(),
                                  style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'ID: ${m.clientEntityId} • Op: ${m.operation.name}',
                                      style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600),
                                    ),
                                    Text(
                                      'Queued: ${DateFormat("HH:mm:ss").format(m.timestamp)} • Retries: ${m.retryCount}',
                                      style: GoogleFonts.poppins(fontSize: 10, color: AppColors.textMuted),
                                    ),
                                    if (m.lastError != null)
                                      Text(
                                        'Error: ${m.lastError}',
                                        style: GoogleFonts.poppins(fontSize: 9.5, color: AppColors.danger),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    );
                  }),
                  const SizedBox(height: AppSpacing.xl),

                  // Actions
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            Get.back();
                            Get.snackbar(
                              'Synchronization',
                              'Triggering bi-directional background sync...',
                              snackPosition: SnackPosition.BOTTOM,
                            );
                            await syncEngine.syncAll(force: true);
                          },
                          icon: const Icon(Icons.sync_rounded, size: 18),
                          label: const Text('Force Sync Now'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: AppSpacing.roundedSm),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      OutlinedButton.icon(
                        onPressed: () async {
                          await queue.resetFailedMutations();
                          Get.back();
                          Get.snackbar('Queue Reset', 'Retry counters reset for all queued mutations.');
                        },
                        icon: const Icon(Icons.refresh_rounded, size: 18),
                        label: const Text('Retry Failed'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          side: const BorderSide(color: AppColors.primary),
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                          shape: RoundedRectangleBorder(borderRadius: AppSpacing.roundedSm),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.lg),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.primary),
        const SizedBox(width: 6),
        Text(title, style: AppTypography.titleSmall),
      ],
    );
  }

  Widget _buildDiagRow(String label, String value, {Color? color, bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary)),
        Flexible(
          child: Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 12,
              fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
              color: color ?? AppColors.textPrimary,
            ),
            textAlign: TextAlign.end,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

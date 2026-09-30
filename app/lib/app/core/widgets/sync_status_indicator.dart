import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../data/services/network_connectivity_service.dart';
import '../../data/sync/sync_engine.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../../modules/dashboard/widgets/sync_diagnostics_sheet.dart';

class SyncStatusIndicator extends StatelessWidget {
  final bool showLabel;
  final bool isCompact;

  const SyncStatusIndicator({
    super.key,
    this.showLabel = true,
    this.isCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<SyncEngine>()) return const SizedBox.shrink();

    final syncEngine = SyncEngine.to;
    final connectivity = NetworkConnectivityService.to;

    return Obx(() {
      final status = syncEngine.syncStatus.value;
      final pendingCount = syncEngine.pendingMutationsCount.value;
      final isOnline = connectivity.isOnline.value;

      Color badgeBg;
      Color badgeBorder;
      Color iconColor;
      IconData iconData;
      String label;

      if (!isOnline) {
        badgeBg = Colors.blueGrey.shade800.withValues(alpha: 0.85);
        badgeBorder = Colors.blueGrey.shade600;
        iconColor = Colors.white70;
        iconData = Icons.cloud_off_rounded;
        label = pendingCount > 0 ? '$pendingCount offline' : 'Offline';
      } else {
        switch (status) {
          case SyncStatus.syncing:
            badgeBg = AppColors.info.withValues(alpha: 0.15);
            badgeBorder = AppColors.info.withValues(alpha: 0.4);
            iconColor = Colors.white;
            iconData = Icons.sync_rounded;
            label = 'Syncing...';
            break;
          case SyncStatus.pending:
            badgeBg = AppColors.warning.withValues(alpha: 0.2);
            badgeBorder = AppColors.warning.withValues(alpha: 0.5);
            iconColor = AppColors.warning;
            iconData = Icons.cloud_upload_outlined;
            label = '$pendingCount pending';
            break;
          case SyncStatus.failed:
            badgeBg = AppColors.danger.withValues(alpha: 0.2);
            badgeBorder = AppColors.danger.withValues(alpha: 0.5);
            iconColor = AppColors.danger;
            iconData = Icons.sync_problem_rounded;
            label = 'Sync issue';
            break;
          case SyncStatus.synced:
          case SyncStatus.idle:
            badgeBg = AppColors.success.withValues(alpha: 0.18);
            badgeBorder = AppColors.success.withValues(alpha: 0.4);
            iconColor = AppColors.accent;
            iconData = Icons.cloud_done_rounded;
            label = 'Synced';
            break;
        }
      }

      return Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: AppSpacing.roundedFull,
          onTap: () {
            SyncDiagnosticsSheet.show();
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            padding: EdgeInsets.symmetric(
              horizontal: isCompact ? 8 : 10,
              vertical: isCompact ? 4 : 5,
            ),
            decoration: BoxDecoration(
              color: badgeBg,
              borderRadius: AppSpacing.roundedFull,
              border: Border.all(color: badgeBorder, width: 1.0),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (status == SyncStatus.syncing && isOnline)
                  SizedBox(
                    width: 13,
                    height: 13,
                    child: CircularProgressIndicator(
                      strokeWidth: 1.8,
                      valueColor: AlwaysStoppedAnimation<Color>(iconColor),
                    ),
                  )
                else
                  Icon(iconData, size: 14, color: iconColor),
                if (showLabel && !isCompact) ...[
                  const SizedBox(width: 5),
                  Text(
                    label,
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      );
    });
  }
}

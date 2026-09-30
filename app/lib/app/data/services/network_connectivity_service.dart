import 'dart:async';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:get/get.dart';
import '../../core/values/constants.dart';

enum NetworkState {
  offline,
  unreachable,
  online,
}

class NetworkConnectivityService extends GetxService {
  static NetworkConnectivityService get to => Get.find<NetworkConnectivityService>();

  final Connectivity _connectivity = Connectivity();
  final Rx<NetworkState> networkState = NetworkState.online.obs;
  final RxBool isOnline = true.obs;
  final Rx<DateTime?> lastCheckedAt = Rx<DateTime?>(null);

  StreamSubscription<List<ConnectivityResult>>? _subscription;
  Timer? _heartbeatTimer;
  bool _isChecking = false;

  /// Callbacks for connectivity restoration
  final List<void Function()> _onRestoredListeners = [];

  Future<NetworkConnectivityService> init() async {
    // Initial hardware check
    await checkReachability();

    // Listen to network interface changes
    _subscription = _connectivity.onConnectivityChanged.listen((results) async {
      await checkReachability();
    });

    // Periodic heartbeat every 30 seconds to detect silent drops (captive portal, DNS failure)
    _heartbeatTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      checkReachability();
    });

    return this;
  }

  void addOnRestoredListener(void Function() listener) {
    _onRestoredListeners.add(listener);
  }

  void removeOnRestoredListener(void Function() listener) {
    _onRestoredListeners.remove(listener);
  }

  /// Verifies true end-to-end reachability, not just local interface state
  Future<bool> checkReachability() async {
    if (_isChecking) return isOnline.value;
    _isChecking = true;

    try {
      final results = await _connectivity.checkConnectivity();
      if (results.contains(ConnectivityResult.none)) {
        _updateState(NetworkState.offline);
        return false;
      }

      // Hardware is connected, test active ping to backend host or public DNS
      final bool reachable = await _pingBackend();
      if (reachable) {
        final wasOffline = !isOnline.value;
        _updateState(NetworkState.online);
        if (wasOffline) {
          Get.log('[CONNECTIVITY] Internet connectivity restored. Notifying listeners.');
          for (final listener in List.of(_onRestoredListeners)) {
            try {
              listener();
            } catch (e) {
              Get.log('[CONNECTIVITY] Error in onRestored listener: $e');
            }
          }
        }
        return true;
      } else {
        _updateState(NetworkState.unreachable);
        return false;
      }
    } catch (_) {
      _updateState(NetworkState.offline);
      return false;
    } finally {
      lastCheckedAt.value = DateTime.now();
      _isChecking = false;
    }
  }

  Future<bool> _pingBackend() async {
    try {
      final uri = Uri.tryParse(constants.supabaseUrl);
      final host = uri?.host ?? 'google.com';

      final lookup = await InternetAddress.lookup(host).timeout(
        const Duration(seconds: 4),
        onTimeout: () => [],
      );

      return lookup.isNotEmpty && lookup.first.rawAddress.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  void _updateState(NetworkState newState) {
    networkState.value = newState;
    isOnline.value = newState == NetworkState.online;
  }

  @override
  void onClose() {
    _subscription?.cancel();
    _heartbeatTimer?.cancel();
    super.onClose();
  }
}

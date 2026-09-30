import 'dart:async';
import 'package:get/get.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../data/models/farm_models.dart';
import '../../../data/repositories/farm_repository.dart';
import '../../../data/services/local_database_service.dart';

class WithdrawalCalendarController extends GetxController {
  final FarmRepository repository = Get.find<FarmRepository>();

  var focusedDay = DateTime.now().obs;
  var selectedDay = DateTime.now().obs;
  var calendarFormat = CalendarFormat.month.obs;

  var withdrawals = <Withdrawal>[].obs;
  var isLoading = false.obs;

  var selectedFilter = 'All Herd'.obs;
  final filters = ['All Herd', 'Dairy Cattle', 'Buffaloes', 'Goats & Sheep', 'Fishery Ponds'];
  StreamSubscription? _dbSubscription;

  @override
  void onInit() {
    super.onInit();
    fetchWithdrawals();

    // Listen to local database changes so new treatments reactively appear on calendar
    _dbSubscription = LocalDatabaseService().watchWithdrawals().listen((_) {
      fetchWithdrawals(isBackground: true);
    });
  }

  @override
  void onClose() {
    _dbSubscription?.cancel();
    super.onClose();
  }

  Future<void> fetchWithdrawals({bool isBackground = false}) async {
    try {
      if (!isBackground && withdrawals.isEmpty) {
        isLoading.value = true;
      }
      
      // Fetch from offline-first repository
      final list = await repository.getWithdrawals();
      withdrawals.assignAll(list);
    } catch (e) {
      Get.log('Withdrawal fetch note: $e');
    } finally {
      isLoading.value = false;
    }
  }

  List<Withdrawal> get filteredWithdrawals {
    if (selectedFilter.value == 'All Herd') return withdrawals;

    final filter = selectedFilter.value.toLowerCase();
    return withdrawals.where((w) {
      final species = (w.animal?.species ?? '').toLowerCase().trim();
      if (filter.contains('cattle') || filter.contains('cow')) {
        return species == 'cow' || species == 'cattle';
      }
      if (filter.contains('buffalo')) {
        return species == 'buffalo';
      }
      if (filter.contains('goat') || filter.contains('sheep')) {
        return species == 'goat' || species == 'sheep';
      }
      if (filter.contains('fish') || filter.contains('pond')) {
        return species == 'fishery' || species == 'fish' || species == 'aquaculture';
      }
      return true;
    }).toList();
  }

  List<Withdrawal> getWithdrawalsForDay(DateTime day) {
    return filteredWithdrawals.where((w) {
      final isClearance = isSameDay(w.endDate, day);
      final isDuring = isDayInWithhold(w, day);
      return isClearance || isDuring;
    }).toList();
  }

  bool isDayInWithhold(Withdrawal w, DateTime day) {
    final start = DateTime(w.startDate.year, w.startDate.month, w.startDate.day);
    final end = DateTime(w.endDate.year, w.endDate.month, w.endDate.day);
    final current = DateTime(day.year, day.month, day.day);

    return (current.isAtSameMomentAs(start) || current.isAfter(start)) && current.isBefore(end);
  }

  bool hasActiveWithdrawal(DateTime day) {
    return filteredWithdrawals.any((w) => isDayInWithhold(w, day));
  }

  bool isClearanceDay(DateTime day) {
    return filteredWithdrawals.any((w) => isSameDay(w.endDate, day));
  }

  int get activeWithholdsCount {
    return withdrawals.where((w) => w.status == 'active' && w.endDate.isAfter(DateTime.now())).length;
  }

  int get upcomingClearancesCount {
    final now = DateTime.now();
    final sevenDays = now.add(const Duration(days: 7));
    return withdrawals.where((w) => w.endDate.isAfter(now) && w.endDate.isBefore(sevenDays)).length;
  }
}

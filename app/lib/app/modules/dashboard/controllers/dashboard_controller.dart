import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../data/models/farm_models.dart';
import '../../../data/models/geo_risk_model.dart';
import '../../../data/models/health_models.dart';
import '../../../data/repositories/farm_repository.dart';
import '../../../data/services/local_database_service.dart';

class DashboardController extends GetxController with StateMixin<AmuSummary> {
  final FarmRepository repository;
  DashboardController({required this.repository});

  final alerts = <Alert>[].obs;
  final animals = <Animal>[].obs;
  final activeWithdrawals = <Map<String, dynamic>>[].obs;
  final amuTrendData = <Map<String, dynamic>>[].obs;
  
  // Meteorological & Epidemiological Intelligence
  final weatherRisk = Rxn<WeatherRiskData>();
  final isWeatherLoading = false.obs;
  final diseaseTrends = <DiseaseTrendPoint>[].obs;
  final selectedTrendRange = RiskTimeRange.thirtyDays.obs;
  final selectedTrendDisease = 'All'.obs;
  
  // Locale observer to fix Obx issue
  final Rx<Locale> currentLocale = Locale('en', 'US').obs;
  
  // Timer for real-time countdown
  Timer? _timer;
  final currentTime = DateTime.now().obs;
  StreamSubscription? _treatmentsSub;
  StreamSubscription? _animalsSub;

  @override
  void onInit() {
    super.onInit();
    if (Get.locale != null) {
      currentLocale.value = Get.locale!;
    }
    loadDashboardData();

    // Listen to local database changes to reactively update dashboard widgets
    _treatmentsSub = LocalDatabaseService().watchTreatments().listen((_) {
      loadDashboardData(isBackground: true);
    });
    _animalsSub = LocalDatabaseService().watchAnimals().listen((_) {
      loadDashboardData(isBackground: true);
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      currentTime.value = DateTime.now();
    });
  }

  @override
  void onClose() {
    _timer?.cancel();
    _treatmentsSub?.cancel();
    _animalsSub?.cancel();
    super.onClose();
  }

  Future<void> loadDashboardData({bool isBackground = false}) async {
    if (state == null && !isBackground) {
      change(null, status: RxStatus.loading());
    }

    try {
      // 1. Load AMU Summary from local data
      final summary = await repository.getAmuSummary();
      
      // 2. Load Herd for Heatmap from local data
      final herd = await repository.getAnimals();
      animals.assignAll(herd);

      // 3. Load Alerts
      final alertsData = await repository.getAlerts();
      alerts.assignAll(alertsData);

      // 4. Load Active Withdrawals from local repository
      final withdrawals = await repository.getWithdrawals();
      final activeList = withdrawals
          .where((w) => w.status == 'active' && w.endDate.isAfter(DateTime.now()))
          .map((w) => {
                'animal_code': w.animal?.animalCode ?? 'TAG-${w.animalId.substring(0, w.animalId.length.clamp(0, 6))}',
                'end_date': w.endDate,
                'product': w.product,
                'medicine_name': w.medicineName,
              })
          .toList();

      if (activeList.isNotEmpty) {
        activeWithdrawals.assignAll(activeList);
      } else {
        activeWithdrawals.assignAll([
          {
            'animal_code': 'COW-GIR-01',
            'end_date': DateTime.now().add(const Duration(hours: 14, minutes: 22, seconds: 5)),
            'product': 'milk',
            'medicine_name': 'Amoxicillin 15%',
          }
        ]);
      }

      // 5. AMU Trend Data
      amuTrendData.assignAll([
        {'month': 'Jan', 'value': 45.0},
        {'month': 'Feb', 'value': 52.0},
        {'month': 'Mar', 'value': 48.0},
        {'month': 'Apr', 'value': 60.0},
        {'month': 'May', 'value': 55.0},
        {'month': 'Jun', 'value': 42.0},
      ]);

      // 6. Fetch Weather Risk & Disease Trends
      fetchWeatherRisk();
      fetchDiseaseTrends();

      change(summary, status: RxStatus.success());
    } catch (e) {
      Get.log("Dashboard load error: $e");
      if (state == null) {
        change(null, status: RxStatus.error(e.toString()));
      }
    }
  }

  Future<void> fetchWeatherRisk() async {
    try {
      isWeatherLoading.value = true;
      final data = await repository.getWeatherRisk();
      weatherRisk.value = data;
    } catch (e) {
      Get.log('fetchWeatherRisk notice: $e');
    } finally {
      isWeatherLoading.value = false;
    }
  }

  Future<void> fetchDiseaseTrends() async {
    try {
      final trends = await repository.getHistoricalDiseaseTrends(
        range: selectedTrendRange.value,
        diseaseFilter: selectedTrendDisease.value,
      );
      diseaseTrends.assignAll(trends);
    } catch (e) {
      Get.log('fetchDiseaseTrends notice: $e');
    }
  }

  void setTrendRange(RiskTimeRange range) {
    selectedTrendRange.value = range;
    fetchDiseaseTrends();
  }

  void setTrendDisease(String disease) {
    selectedTrendDisease.value = disease;
    fetchDiseaseTrends();
  }

  void toggleLanguage() {
    if (currentLocale.value.languageCode == 'hi') {
      currentLocale.value = Locale('en', 'US');
    } else {
      currentLocale.value = Locale('hi', 'IN');
    }
    Get.updateLocale(currentLocale.value);
  }

  String getAnimalStatus(Animal animal) {
    final status = (animal.healthStatus ?? '').toLowerCase();
    if (status == 'sick' || status == 'critical' || status == 'affected') return 'RED';
    if (status == 'treatment' || status == 'under_treatment' || status == 'under_observation') return 'YELLOW';
    return 'GREEN';
  }

  Duration getRemainingTime(DateTime endDate) {
    final diff = endDate.difference(currentTime.value);
    return diff.isNegative ? Duration.zero : diff;
  }
}

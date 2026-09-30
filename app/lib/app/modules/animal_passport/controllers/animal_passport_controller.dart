import 'package:get/get.dart';
import '../../../data/models/farm_models.dart';
import '../../../data/repositories/farm_repository.dart';

class AnimalPassportController extends GetxController with StateMixin<PublicPassport> {
  final FarmRepository repository;
  AnimalPassportController({required this.repository});

  final qrToken = ''.obs;

  @override
  void onInit() {
    super.onInit();
    final dynamic args = Get.arguments;
    if (args != null && args.toString().isNotEmpty) {
      fetchPublicPassport(args.toString());
    } else {
      // Load default demo/active animal passport so screen immediately displays values
      fetchPublicPassport('COW-GIR-01');
    }
  }

  Future<void> fetchPublicPassport(String token) async {
    final query = token.trim();
    if (query.isEmpty) return;

    qrToken.value = query;
    change(null, status: RxStatus.loading());

    try {
      final passport = await repository.getPublicPassport(query);
      change(passport, status: RxStatus.success());
    } catch (e) {
      Get.log("Passport fetch error: $e");
      change(null, status: RxStatus.error("Unable to verify animal. Please check the QR token."));
    }
  }
}

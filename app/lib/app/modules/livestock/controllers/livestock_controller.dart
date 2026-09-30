import 'dart:async';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/services/cloudinary_service.dart';
import '../../../data/models/farm_models.dart';
import '../../../data/models/health_models.dart';
import '../../../data/repositories/farm_repository.dart';
import '../../../data/services/local_database_service.dart';

class LivestockController extends GetxController with StateMixin<List<Animal>> {
  final FarmRepository repository;
  LivestockController({required this.repository});

  final selectedSpecies = 'all'.obs;
  final herdSummary = Rxn<HerdHealthSummary>();
  final Rx<Uint8List?> selectedImageBytes = Rx<Uint8List?>(null);
  String? selectedImageName;
  final RxBool isUploading = false.obs;
  final CloudinaryService _cloudinary = CloudinaryService();
  StreamSubscription? _dbSubscription;

  @override
  void onInit() {
    super.onInit();
    // Reactively fetch animals when selected species changes
    ever(selectedSpecies, (_) => fetchAnimals());

    // Listen to local database changes for reactive updates
    _dbSubscription = LocalDatabaseService().watchAnimals().listen((_) {
      fetchAnimals(isBackground: true);
    });

    fetchAnimals();
  }

  @override
  void onClose() {
    _dbSubscription?.cancel();
    super.onClose();
  }

  Future<void> fetchAnimals({bool isBackground = false}) async {
    // Only show loading if we don't already have rendered state (avoid blank screen flicker)
    if (state == null && !isBackground) {
      change(null, status: RxStatus.loading());
    }

    try {
      final selected = selectedSpecies.value.toLowerCase().trim();
      final allAnimals = await repository.getAnimals();
      List<Animal> animals;

      if (selected == 'all') {
        animals = allAnimals;
      } else if (selected == 'other') {
        final knownSpecies = ['cow', 'buffalo', 'goat', 'sheep', 'fishery'];
        animals = allAnimals.where((a) => 
          a.species == null || 
          a.species!.toLowerCase() == 'other' || 
          !knownSpecies.contains(a.species!.toLowerCase().trim())
        ).toList();
      } else {
        animals = allAnimals.where((a) => 
          a.species != null && 
          a.species!.toLowerCase().trim() == selected
        ).toList();
      }
      
      if (animals.isEmpty) {
        change([], status: RxStatus.empty());
      } else {
        change(animals, status: RxStatus.success());
      }

      // Fetch herd health analytics from local data
      try {
        final summary = await repository.getHerdHealthSummary(
          species: selected == 'all' ? null : selected,
        );
        herdSummary.value = summary;
      } catch (_) {}
    } catch (e) {
      Get.log("Fetch Animals Error: $e");
      if (state == null) {
        change(null, status: RxStatus.error(e.toString()));
      }
    }
  }

  Future<void> pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: source, imageQuality: 70);
    if (pickedFile != null) {
      final bytes = await pickedFile.readAsBytes();
      selectedImageBytes.value = bytes;
      selectedImageName = pickedFile.name;
    }
  }

  Future<String?> uploadToCloudinary(Uint8List bytes, String fileName) async {
    try {
      isUploading.value = true;
      final result = await _cloudinary.uploadImage(
        bytes: bytes,
        fileName: fileName,
        folder: 'animals',
      );
      return result.secureUrl;
    } catch (e) {
      Get.log("Upload Error (will use local fallback): $e");
      return null;
    } finally {
      isUploading.value = false;
    }
  }

  Future<void> registerAnimal(Animal animal) async {
    try {
      isUploading.value = true;
      if (selectedImageBytes.value != null && selectedImageName != null) {
        final imageUrl = await uploadToCloudinary(selectedImageBytes.value!, selectedImageName!);
        animal.imageUrl = imageUrl;
      }
      
      // Save locally & queue for sync optimistically
      await repository.registerAnimal(animal);
      await fetchAnimals(isBackground: true);

      selectedImageBytes.value = null;
      selectedImageName = null;
      Get.back();
      Get.snackbar(
        'Animal Registered',
        'Saved to local farm registry and queued for synchronization.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green.shade800,
        colorText: Colors.white,
      );
    } catch (e) {
      Get.snackbar('Error', 'Failed to register animal: $e');
    } finally {
      isUploading.value = false;
    }
  }
}

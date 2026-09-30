import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'app/routes/app_pages.dart';
import 'app/core/values/strings.dart';
import 'app/core/values/constants.dart';
import 'app/core/translations/app_translations.dart';
import 'app/core/services/fcm_alert_service.dart';
import 'app/core/theme/app_theme.dart';
import 'app/data/providers/api_provider.dart';
import 'app/data/repositories/farm_repository.dart';
import 'app/data/services/local_database_service.dart';
import 'app/data/services/network_connectivity_service.dart';
import 'app/data/sync/sync_engine.dart';
import 'app/modules/auth/controllers/auth_controller.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  // 1. Initialize Structured Local Database First (Immediate Local Rendering)
  await LocalDatabaseService().init();

  // 2. Initialize Supabase
  await Supabase.initialize(
    url: constants.supabaseUrl,
    publishableKey: constants.supabaseKey,
  );

  // 3. Register Core Connectivity & Sync Engine
  Get.put(NetworkConnectivityService(), permanent: true);
  await NetworkConnectivityService.to.init();

  Get.put(SyncEngine(), permanent: true);
  await SyncEngine.to.init();

  // 4. Register API Provider & Offline-First Repository
  Get.put(ApiProvider(), permanent: true);
  Get.put(FarmRepository(apiProvider: Get.find<ApiProvider>()), permanent: true);

  // 5. Initialize Global Auth & Push Alert Services
  Get.put(AuthController(), permanent: true);
  Get.put(FcmAlertService());

  final session = Supabase.instance.client.auth.currentSession;
  final cachedUser = LocalDatabaseService().getLatestUserProfile();
  final String initialRoute = (session != null || cachedUser != null) ? Routes.DASHBOARD : Routes.LOGIN;

  runApp(
    GetMaterialApp(
      title: AppStrings.appName,
      initialRoute: initialRoute,
      getPages: AppPages.routes,
      translations: AppTranslations(),
      locale: const Locale('en', 'US'),
      fallbackLocale: const Locale('en', 'US'),
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      defaultTransition: Transition.rightToLeftWithFade,
      transitionDuration: const Duration(milliseconds: 260),
      customTransition: null,
    ),
  );
}

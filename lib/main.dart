import 'package:flutter/material.dart';

import 'app.dart';
import 'controllers/premium_controller.dart';
import 'services/ads_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AdsService.instance.initialize();
  await PremiumController.instance.initialize();
  runApp(const QuickSumApp());
}

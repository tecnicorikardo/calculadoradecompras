import 'package:flutter/material.dart';

import 'app.dart';
import 'controllers/pro_controller.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ProController.instance.initialize();
  runApp(const QuickSumApp());
}

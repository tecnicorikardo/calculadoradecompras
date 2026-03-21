import 'package:flutter/material.dart';

import 'core/config/app_info.dart';
import 'core/theme/app_theme.dart';
import 'screens/shopping_screen.dart';
import 'services/app_preferences_service.dart';

class QuickSumApp extends StatefulWidget {
  const QuickSumApp({super.key});

  @override
  State<QuickSumApp> createState() => _QuickSumAppState();
}

class _QuickSumAppState extends State<QuickSumApp> {
  final AppPreferencesService _preferencesService = AppPreferencesService();
  ThemeMode _themeMode = ThemeMode.light;

  @override
  void initState() {
    super.initState();
    _loadThemeMode();
  }

  Future<void> _loadThemeMode() async {
    final themeMode = await _preferencesService.loadThemeMode();
    if (!mounted) {
      return;
    }
    setState(() => _themeMode = themeMode);
  }

  void _handleThemeModeChanged(ThemeMode themeMode) {
    if (_themeMode == themeMode) {
      return;
    }

    setState(() => _themeMode = themeMode);
    _preferencesService.saveThemeMode(themeMode);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppInfo.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: _themeMode,
      home: ShoppingScreen(
        themeMode: _themeMode,
        onThemeModeChanged: _handleThemeModeChanged,
      ),
    );
  }
}

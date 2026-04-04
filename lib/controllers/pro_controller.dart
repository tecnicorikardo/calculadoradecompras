import 'package:flutter/foundation.dart';

import '../services/pro_service.dart';

class ProController extends ChangeNotifier {
  ProController._();
  static final ProController instance = ProController._();

  bool _isPro = false;
  bool _isTrialActive = true;
  int _trialDaysRemaining = 30;
  bool _isLoading = true;

  bool get isPro => _isPro;
  bool get isTrialActive => _isTrialActive;
  bool get hasAccess => _isPro || _isTrialActive;
  int get trialDaysRemaining => _trialDaysRemaining;
  bool get isLoading => _isLoading;

  Future<void> initialize() async {
    await ProService.instance.ensureTrialStarted();

    _isPro = await ProService.instance.isPro();
    _isTrialActive = await ProService.instance.isTrialActive();
    _trialDaysRemaining = await ProService.instance.trialDaysRemaining();
    _isLoading = false;

    notifyListeners();
  }

  Future<void> refresh() async {
    _isPro = await ProService.instance.isPro();
    _isTrialActive = await ProService.instance.isTrialActive();
    _trialDaysRemaining = await ProService.instance.trialDaysRemaining();
    notifyListeners();
  }

  Future<void> activatePro() async {
    await ProService.instance.activateProLocally();
    _isPro = true;
    notifyListeners();
  }
}

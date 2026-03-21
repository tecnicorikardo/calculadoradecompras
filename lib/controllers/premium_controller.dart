import 'package:flutter/foundation.dart';

import '../services/premium_service.dart';

/// Estado global de monetização.
/// Use [PremiumController.instance] para acessar de qualquer lugar.
class PremiumController extends ChangeNotifier {
  PremiumController._();
  static final PremiumController instance = PremiumController._();

  bool _isPro = false;
  bool _purchaseInProgress = false;

  bool get isPro => _isPro;
  bool get showAds => !_isPro;
  bool get purchaseInProgress => _purchaseInProgress;

  /// Carrega o status salvo e registra o callback do PremiumService.
  Future<void> initialize() async {
    _isPro = await PremiumService.instance.loadIsPro();
    PremiumService.instance.onProStatusChanged = _onProStatusChanged;
    PremiumService.instance.initialize();
    notifyListeners();
  }

  void _onProStatusChanged(bool isPro) {
    _isPro = isPro;
    _purchaseInProgress = false;
    notifyListeners();
  }

  void setPurchaseInProgress(bool value) {
    _purchaseInProgress = value;
    notifyListeners();
  }

  @override
  void dispose() {
    PremiumService.instance.dispose();
    super.dispose();
  }
}

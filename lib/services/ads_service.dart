import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

/// IDs de anúncio.
/// Em desenvolvimento use os IDs de teste abaixo.
/// Em produção substitua pelos IDs reais do AdMob.
class AdsConfig {
  // ── IDs de TESTE (nunca use em produção) ────────────────────────────────────
  static const String testBannerAdUnitId =
      'ca-app-pub-3940256099942544/6300978111';

  // ── IDs de PRODUÇÃO ─────────────────────────────────────────────────────────
  // Substitua pelo ID real gerado no painel do AdMob após aprovação.
  static const String prodBannerAdUnitId =
      'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

  // Troque para false antes de publicar na Play Store.
  static const bool useTestAds = true;

  static String get bannerAdUnitId =>
      useTestAds ? testBannerAdUnitId : prodBannerAdUnitId;
}

class AdsService {
  AdsService._();
  static final AdsService instance = AdsService._();

  bool _initialized = false;

  Future<void> initialize() async {
    if (kIsWeb) return;
    if (_initialized) return;
    await MobileAds.instance.initialize();
    _initialized = true;
  }
}

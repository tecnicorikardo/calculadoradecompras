import 'dart:async';

import 'package:flutter/foundation.dart';

import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// ID do produto configurado na Play Console.
/// Altere aqui se usar um ID diferente.
const String kProProductId = 'pro_lifetime';

const String _prefKeyIsPro = 'is_pro';

class PremiumService {
  PremiumService._();
  static final PremiumService instance = PremiumService._();

  InAppPurchase get _iap => InAppPurchase.instance;
  StreamSubscription<List<PurchaseDetails>>? _subscription;

  /// Callback chamado quando o status PRO muda.
  void Function(bool isPro)? onProStatusChanged;

  // ── Persistência ────────────────────────────────────────────────────────────

  Future<bool> loadIsPro() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_prefKeyIsPro) ?? false;
  }

  Future<void> _saveIsPro(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefKeyIsPro, value);
  }

  // ── Inicialização ────────────────────────────────────────────────────────────

  /// Inicia o listener de compras. Chamar uma vez no app.
  void initialize() {
    if (kIsWeb) return;
    _subscription = _iap.purchaseStream.listen(
      _handlePurchaseUpdates,
      onError: (_) {/* erros de stream — ignorar silenciosamente */},
    );
  }

  void dispose() {
    _subscription?.cancel();
  }

  // ── Consulta de produto ──────────────────────────────────────────────────────

  Future<ProductDetails?> fetchProduct() async {
    if (kIsWeb) return null;
    final available = await _iap.isAvailable();
    if (!available) return null;

    final response = await _iap.queryProductDetails({kProProductId});
    if (response.productDetails.isEmpty) return null;
    return response.productDetails.first;
  }

  // ── Compra ───────────────────────────────────────────────────────────────────

  /// Inicia o fluxo de compra. Retorna false se a loja não estiver disponível.
  Future<bool> buyPro(ProductDetails product) async {
    if (kIsWeb) return false;
    final available = await _iap.isAvailable();
    if (!available) return false;

    final param = PurchaseParam(productDetails: product);
    return _iap.buyNonConsumable(purchaseParam: param);
  }

  // ── Restauração ──────────────────────────────────────────────────────────────

  Future<void> restorePurchases() async {
    if (kIsWeb) return;
    await _iap.restorePurchases();
  }

  // ── Handler interno ──────────────────────────────────────────────────────────

  void _handlePurchaseUpdates(List<PurchaseDetails> purchases) {
    for (final purchase in purchases) {
      if (purchase.productID != kProProductId) continue;

      if (purchase.status == PurchaseStatus.purchased ||
          purchase.status == PurchaseStatus.restored) {
        _saveIsPro(true);
        onProStatusChanged?.call(true);
      }

      // Finaliza a transação obrigatoriamente
      if (purchase.pendingCompletePurchase) {
        _iap.completePurchase(purchase);
      }
    }
  }
}

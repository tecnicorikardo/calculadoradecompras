import 'package:flutter/material.dart';
import 'package:in_app_purchase/in_app_purchase.dart';

import '../controllers/premium_controller.dart';
import '../core/theme/app_palette.dart';
import '../services/premium_service.dart';

/// Bottom sheet de upgrade PRO e restauração de compra.
class UpgradeSheet extends StatefulWidget {
  const UpgradeSheet({super.key});

  @override
  State<UpgradeSheet> createState() => _UpgradeSheetState();
}

class _UpgradeSheetState extends State<UpgradeSheet> {
  ProductDetails? _product;
  bool _loading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchProduct();
  }

  Future<void> _fetchProduct() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });
    final product = await PremiumService.instance.fetchProduct();
    if (!mounted) return;
    setState(() {
      _product = product;
      _loading = false;
      if (product == null) {
        _errorMessage = 'Produto não encontrado na loja.\nVerifique sua conexão ou tente mais tarde.';
      }
    });
  }

  Future<void> _handleBuy() async {
    if (_product == null) return;
    final controller = PremiumController.instance;
    controller.setPurchaseInProgress(true);

    final ok = await PremiumService.instance.buyPro(_product!);
    if (!ok && mounted) {
      controller.setPurchaseInProgress(false);
      _showSnack('Não foi possível iniciar a compra. Tente novamente.');
    }
    // Resultado chega via stream → PremiumController._onProStatusChanged
  }

  Future<void> _handleRestore() async {
    final controller = PremiumController.instance;
    controller.setPurchaseInProgress(true);
    await PremiumService.instance.restorePurchases();
    if (!mounted) return;
    controller.setPurchaseInProgress(false);
    _showSnack('Restauração concluída.');
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final palette = context.appPalette;

    return Container(
      decoration: BoxDecoration(
        color: palette.surfaceSheet,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      child: SafeArea(
        top: false,
        child: ListenableBuilder(
          listenable: PremiumController.instance,
          builder: (context, _) {
            final controller = PremiumController.instance;

            // Já é PRO — mostra confirmação
            if (controller.isPro) {
              return _ProConfirmedContent(palette: palette, theme: theme);
            }

            return Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                // Handle
                Center(
                  child: Container(
                    width: 46,
                    height: 5,
                    decoration: BoxDecoration(
                      color: palette.handle,
                      borderRadius: BorderRadius.circular(99),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Ícone
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: palette.accentSoft,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Icon(Icons.workspace_premium_rounded,
                      size: 36, color: palette.accent),
                ),
                const SizedBox(height: 16),

                Text(
                  'Versão PRO',
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Compra única e vitalícia.\nRemova os anúncios para sempre.',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: palette.textSecondary,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 28),

                // Botão comprar
                if (_loading)
                  const CircularProgressIndicator()
                else if (_errorMessage != null)
                  Column(
                    children: <Widget>[
                      Text(
                        _errorMessage!,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: palette.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextButton(
                        onPressed: _fetchProduct,
                        child: const Text('Tentar novamente'),
                      ),
                    ],
                  )
                else
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: controller.purchaseInProgress ? null : _handleBuy,
                      style: FilledButton.styleFrom(
                        backgroundColor: palette.accent,
                        foregroundColor: palette.accentForeground,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(22),
                        ),
                      ),
                      child: controller.purchaseInProgress
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : Text(
                              'Remover anúncios por ${_product?.price ?? 'R\$ 7,99'}',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w800,
                                color: palette.accentForeground,
                              ),
                            ),
                    ),
                  ),

                const SizedBox(height: 12),

                // Restaurar compra
                TextButton(
                  onPressed: controller.purchaseInProgress ? null : _handleRestore,
                  style: TextButton.styleFrom(foregroundColor: palette.textSecondary),
                  child: const Text('Restaurar compra'),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _ProConfirmedContent extends StatelessWidget {
  const _ProConfirmedContent({required this.palette, required this.theme});

  final AppPalette palette;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(Icons.check_circle_rounded, size: 64, color: palette.accent),
          const SizedBox(height: 16),
          Text(
            'Você já é PRO',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Anúncios removidos. Obrigado pelo apoio!',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: palette.textSecondary,
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () => Navigator.of(context).pop(),
              style: FilledButton.styleFrom(
                backgroundColor: palette.accent,
                foregroundColor: palette.accentForeground,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(22),
                ),
              ),
              child: const Text('Fechar'),
            ),
          ),
        ],
      ),
    );
  }
}

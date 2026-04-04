import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../controllers/pro_controller.dart';
import '../core/theme/app_palette.dart';
import '../services/pro_service.dart';

class UpgradeSheet extends StatefulWidget {
  const UpgradeSheet({super.key});

  @override
  State<UpgradeSheet> createState() => _UpgradeSheetState();
}

class _UpgradeSheetState extends State<UpgradeSheet> {
  bool _loading = false;
  String? _error;

  Future<void> _handleBuy() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    final url = await ProService.instance.createCheckoutUrl();

    if (!mounted) return;

    if (url == null) {
      setState(() {
        _loading = false;
        _error = 'Não foi possível iniciar o pagamento. Tente novamente.';
      });
      return;
    }

    setState(() => _loading = false);

    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      setState(() => _error = 'Não foi possível abrir o navegador.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final palette = context.appPalette;
    final ctrl = ProController.instance;

    return Container(
      decoration: BoxDecoration(
        color: palette.surfaceSheet,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Container(
                width: 46,
                height: 5,
                decoration: BoxDecoration(
                  color: palette.handle,
                  borderRadius: BorderRadius.circular(99),
                ),
              ),
              const SizedBox(height: 28),
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: palette.accentSoft,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Icon(
                  Icons.workspace_premium_rounded,
                  color: palette.accent,
                  size: 36,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Soma Fácil PRO',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                ctrl.isTrialActive
                    ? 'Você tem ${ctrl.trialDaysRemaining} dias grátis restantes.\nApós isso, adquira o acesso vitalício.'
                    : 'Seu período gratuito encerrou.\nAdquira o acesso vitalício por apenas R\$ 10.',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: palette.textSecondary,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 28),
              // Benefícios
              _BenefitRow(
                icon: Icons.all_inclusive_rounded,
                label: 'Acesso vitalício — pague uma vez',
                palette: palette,
                theme: theme,
              ),
              const SizedBox(height: 10),
              _BenefitRow(
                icon: Icons.block_rounded,
                label: 'Sem anúncios para sempre',
                palette: palette,
                theme: theme,
              ),
              const SizedBox(height: 10),
              _BenefitRow(
                icon: Icons.support_agent_rounded,
                label: 'Suporte prioritário',
                palette: palette,
                theme: theme,
              ),
              const SizedBox(height: 32),
              if (_error != null) ...<Widget>[
                Text(
                  _error!,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: palette.accentStrong,
                  ),
                ),
                const SizedBox(height: 12),
              ],
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _loading ? null : _handleBuy,
                  style: FilledButton.styleFrom(
                    backgroundColor: palette.accent,
                    foregroundColor: palette.accentForeground,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                  child: _loading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Comprar acesso vitalício — R\$ 10,00',
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 15,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: Text(
                  ctrl.isTrialActive ? 'Continuar no período gratuito' : 'Fechar',
                  style: TextStyle(color: palette.textSecondary),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BenefitRow extends StatelessWidget {
  const _BenefitRow({
    required this.icon,
    required this.label,
    required this.palette,
    required this.theme,
  });

  final IconData icon;
  final String label;
  final AppPalette palette;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: palette.accentSoft,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: palette.accent, size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

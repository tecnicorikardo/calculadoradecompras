import 'package:flutter/material.dart';

import '../controllers/shopping_controller.dart';
import '../core/utils/currency_formatters.dart';
import '../models/budget_status.dart';

class SummaryCard extends StatelessWidget {
  const SummaryCard({
    super.key,
    required this.controller,
    this.compact = false,
  });

  final ShoppingController controller;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final palette = _paletteFor(controller.budgetStatus);
    final theme = Theme.of(context);
    final lastItem = controller.lastItem;
    final padding = compact ? 18.0 : 24.0;
    final badgeLabelStyle = theme.textTheme.bodySmall?.copyWith(
      color: Colors.white,
      fontWeight: FontWeight.w700,
    );

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(padding),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[
            palette.backgroundStart,
            palette.backgroundEnd,
          ],
        ),
        borderRadius: BorderRadius.circular(compact ? 26 : 32),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: palette.shadowColor,
            blurRadius: compact ? 18 : 32,
            offset: Offset(0, compact ? 10 : 18),
          ),
        ],
      ),
      child: Column(
        children: <Widget>[
          Row(
            children: <Widget>[
              _TopBadge(
                label: '${controller.itemCount} itens',
                icon: Icons.shopping_bag_outlined,
                compact: compact,
                textStyle: badgeLabelStyle,
              ),
              const Spacer(),
              _TopBadge(
                label: palette.label,
                icon: palette.icon,
                compact: compact,
                textStyle: badgeLabelStyle,
              ),
            ],
          ),
          SizedBox(height: compact ? 12 : 20),
          SizedBox(
            width: double.infinity,
            child: Column(
              children: <Widget>[
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    CurrencyFormatters.brl.format(controller.total),
                    textAlign: TextAlign.center,
                    style: theme.textTheme.displaySmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.8,
                      fontSize: compact ? 34 : 42,
                    ),
                  ),
                ),
                SizedBox(height: compact ? 2 : 6),
                Text(
                  'Soma total',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: Colors.white.withValues(alpha: 0.82),
                    fontWeight: FontWeight.w600,
                    fontSize: compact ? 14 : null,
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: compact ? 12 : 18),
          Container(
            width: double.infinity,
            padding: EdgeInsets.symmetric(
              horizontal: compact ? 14 : 18,
              vertical: compact ? 12 : 16,
            ),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(compact ? 18 : 24),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.14),
              ),
            ),
            child: Column(
              children: <Widget>[
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    lastItem == null
                        ? 'R\$ 0,00'
                        : CurrencyFormatters.brl.format(lastItem.value),
                    textAlign: TextAlign.center,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: compact ? 24 : 30,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Ultimo item adicionado',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withValues(alpha: 0.8),
                    fontWeight: FontWeight.w600,
                    fontSize: compact ? 12 : null,
                  ),
                ),
                if (lastItem?.description != null) ...<Widget>[
                  SizedBox(height: compact ? 6 : 8),
                  Text(
                    lastItem!.description!,
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: compact ? 14 : null,
                    ),
                  ),
                ],
              ],
            ),
          ),
          SizedBox(height: compact ? 12 : 18),
          if (controller.budgetLimit != null) ...<Widget>[
            ClipRRect(
              borderRadius: BorderRadius.circular(99),
              child: LinearProgressIndicator(
                minHeight: compact ? 8 : 10,
                value: controller.progressToLimit > 1 ? 1 : controller.progressToLimit,
                backgroundColor: Colors.white.withValues(alpha: 0.18),
                valueColor: AlwaysStoppedAnimation<Color>(palette.progressColor),
              ),
            ),
            SizedBox(height: compact ? 10 : 14),
          ],
          Container(
            width: double.infinity,
            padding: EdgeInsets.symmetric(
              horizontal: compact ? 12 : 16,
              vertical: compact ? 10 : 14,
            ),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(compact ? 18 : 22),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.14),
              ),
            ),
            child: Text(
              _buildMessage(),
              textAlign: TextAlign.center,
              maxLines: compact ? 2 : 3,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                height: 1.3,
                fontSize: compact ? 13 : null,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _buildMessage() {
    if (controller.budgetLimit == null) {
      return 'Defina um limite para receber alerta antes de estourar o valor.';
    }

    final difference = controller.differenceToLimit;
    if (difference == null) {
      return 'Acompanhe seus gastos em tempo real.';
    }

    if (difference >= 0) {
      return 'Faltam ${CurrencyFormatters.brl.format(difference)} para atingir o limite.';
    }

    return 'Voce ultrapassou o limite em ${CurrencyFormatters.brl.format(difference.abs())}.';
  }

  _SummaryPalette _paletteFor(BudgetStatus status) {
    switch (status) {
      case BudgetStatus.attention:
        return const _SummaryPalette(
          label: 'Atencao',
          backgroundStart: Color(0xFFF4A259),
          backgroundEnd: Color(0xFFE57C23),
          progressColor: Color(0xFFFFF2D8),
          shadowColor: Color(0x29E57C23),
          icon: Icons.warning_amber_rounded,
        );
      case BudgetStatus.exceeded:
        return const _SummaryPalette(
          label: 'Limite excedido',
          backgroundStart: Color(0xFFC1121F),
          backgroundEnd: Color(0xFF780000),
          progressColor: Color(0xFFFFD5D8),
          shadowColor: Color(0x33B42318),
          icon: Icons.report_gmailerrorred_rounded,
        );
      case BudgetStatus.normal:
        return const _SummaryPalette(
          label: 'Normal',
          backgroundStart: Color(0xFF136F63),
          backgroundEnd: Color(0xFF10403B),
          progressColor: Color(0xFFD2F4EE),
          shadowColor: Color(0x2610403B),
          icon: Icons.check_circle_outline_rounded,
        );
    }
  }
}

class _TopBadge extends StatelessWidget {
  const _TopBadge({
    required this.label,
    required this.icon,
    required this.compact,
    required this.textStyle,
  });

  final String label;
  final IconData icon;
  final bool compact;
  final TextStyle? textStyle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 10 : 12,
        vertical: compact ? 8 : 10,
      ),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(compact ? 16 : 20),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.14),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icon, color: Colors.white, size: compact ? 14 : 16),
          SizedBox(width: compact ? 6 : 8),
          Text(label, style: textStyle),
        ],
      ),
    );
  }
}

class _SummaryPalette {
  const _SummaryPalette({
    required this.label,
    required this.backgroundStart,
    required this.backgroundEnd,
    required this.progressColor,
    required this.shadowColor,
    required this.icon,
  });

  final String label;
  final Color backgroundStart;
  final Color backgroundEnd;
  final Color progressColor;
  final Color shadowColor;
  final IconData icon;
}

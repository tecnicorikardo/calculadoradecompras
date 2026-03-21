import 'package:flutter/material.dart';

import '../controllers/shopping_controller.dart';
import '../core/theme/app_palette.dart';
import '../core/utils/currency_formatters.dart';

class ItemsBottomSheet extends StatelessWidget {
  const ItemsBottomSheet({
    super.key,
    required this.controller,
    required this.onClearAll,
    required this.onShare,
  });

  final ShoppingController controller;
  final Future<void> Function() onClearAll;
  final VoidCallback onShare;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final palette = context.appPalette;

    return Container(
      height: MediaQuery.sizeOf(context).height * 0.84,
      decoration: BoxDecoration(
        color: palette.surfaceSheet,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: SafeArea(
        top: false,
        child: AnimatedBuilder(
          animation: controller,
          builder: (context, _) {
            final grouped = controller.groupedItems;

            return Column(
              children: <Widget>[
                const SizedBox(height: 12),
                Container(
                  width: 46,
                  height: 5,
                  decoration: BoxDecoration(
                    color: palette.handle,
                    borderRadius: BorderRadius.circular(99),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 14),
                  child: Row(
                    children: <Widget>[
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              'Itens adicionados',
                              style: theme.textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 7,
                              ),
                              decoration: BoxDecoration(
                                color: palette.accentSoft,
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                '${controller.itemCount} itens • ${CurrencyFormatters.brl.format(controller.total)}',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: palette.accent,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton.filledTonal(
                        onPressed: controller.itemCount == 0 ? null : onClearAll,
                        style: IconButton.styleFrom(
                          backgroundColor: palette.accentSoft,
                          foregroundColor: palette.accent,
                        ),
                        icon: const Icon(Icons.delete_sweep_rounded),
                        tooltip: 'Limpar itens',
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: controller.items.isEmpty
                      ? const _EmptyItemsState()
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
                          itemCount: grouped.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final group = grouped[index];
                            return _GroupedItemCard(
                              group: group,
                              onRemoveOne: () => controller.removeItem(group.ids.last),
                              onRemoveAll: () async {
                                for (final id in [...group.ids]) {
                                  await controller.removeItem(id);
                                }
                              },
                            );
                          },
                        ),
                ),
                Container(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 18),
                  decoration: BoxDecoration(
                    color: palette.surfaceSheet,
                    border: Border(
                      top: BorderSide(color: palette.border),
                    ),
                  ),
                  child: SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: controller.itemCount == 0 ? null : onShare,
                      icon: const Icon(Icons.share_rounded),
                      label: const Text('Compartilhar lista'),
                      style: FilledButton.styleFrom(
                        backgroundColor: palette.accent,
                        foregroundColor: palette.accentForeground,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        textStyle: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(22),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _EmptyItemsState extends StatelessWidget {
  const _EmptyItemsState();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final palette = context.appPalette;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              width: 82,
              height: 82,
              decoration: BoxDecoration(
                color: palette.accentSoft,
                borderRadius: BorderRadius.circular(28),
              ),
              child: Icon(
                Icons.shopping_basket_outlined,
                size: 38,
                color: palette.accent,
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'Nenhum item na lista ainda.',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Use o teclado numerico para somar produtos rapidamente e acompanhar o total em tempo real.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: palette.textSecondary,
                height: 1.45,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GroupedItemCard extends StatelessWidget {
  const _GroupedItemCard({
    required this.group,
    required this.onRemoveOne,
    required this.onRemoveAll,
  });

  final GroupedItem group;
  final VoidCallback onRemoveOne;
  final Future<void> Function() onRemoveAll;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final palette = context.appPalette;
    final description = group.description ?? 'Sem descricao';
    final qty = group.quantity;
    final unitFormatted = CurrencyFormatters.brl.format(group.unitValue);
    final totalFormatted = CurrencyFormatters.brl.format(group.totalValue);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: palette.border),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: palette.shadow,
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          // Badge de quantidade
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: palette.accentSoft,
              borderRadius: BorderRadius.circular(16),
            ),
            alignment: Alignment.center,
            child: Text(
              qty > 1 ? '${qty}x' : '1',
              style: theme.textTheme.titleMedium?.copyWith(
                color: palette.accent,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  description,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                if (qty > 1) ...<Widget>[
                  Text(
                    '$qty x $unitFormatted = $totalFormatted',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: palette.accentStrong,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ] else ...<Widget>[
                  Text(
                    unitFormatted,
                    style: theme.textTheme.titleLarge?.copyWith(
                      color: palette.accentStrong,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          // Botão remove um por vez; segura para remover todos
          GestureDetector(
            onLongPress: qty > 1 ? onRemoveAll : null,
            child: IconButton.filledTonal(
              onPressed: onRemoveOne,
              style: IconButton.styleFrom(
                backgroundColor: palette.accentSoft,
                foregroundColor: palette.accent,
              ),
              icon: const Icon(Icons.remove_rounded),
              tooltip: qty > 1 ? 'Remover 1 (segure para remover todos)' : 'Remover',
            ),
          ),
        ],
      ),
    );
  }
}

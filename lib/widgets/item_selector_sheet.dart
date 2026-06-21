import 'package:flutter/material.dart';

import '../core/theme/app_palette.dart';
import '../services/item_suggestions_service.dart';

class ItemSelectorSheet extends StatefulWidget {
  const ItemSelectorSheet({
    super.key,
    required this.suggestionsService,
    required this.customItems,
    required this.onItemSelected,
  });

  final ItemSuggestionsService suggestionsService;
  final List<String> customItems;
  final Future<void> Function(String item) onItemSelected;

  @override
  State<ItemSelectorSheet> createState() => _ItemSelectorSheetState();
}

class _ItemSelectorSheetState extends State<ItemSelectorSheet> {
  final TextEditingController _searchController = TextEditingController();
  late List<String> _items;

  @override
  void initState() {
    super.initState();
    _items = _searchItems();
    _searchController.addListener(_handleSearchChanged);
  }

  @override
  void didUpdateWidget(covariant ItemSelectorSheet oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.customItems != widget.customItems) {
      _handleSearchChanged();
    }
  }

  void _handleSearchChanged() {
    setState(() {
      _items = _searchItems();
    });
  }

  List<String> _searchItems() {
    return widget.suggestionsService.search(
      _searchController.text,
      customItems: widget.customItems,
    );
  }

  Future<void> _selectItem(String item) async {
    final cleanedItem = widget.suggestionsService.cleanItemName(item);
    if (cleanedItem.isEmpty) {
      return;
    }

    await widget.onItemSelected(cleanedItem);
    if (!mounted) {
      return;
    }
    Navigator.of(context).pop();
  }

  void _handleSearchSubmitted(String value) {
    final cleanedItem = widget.suggestionsService.cleanItemName(value);
    if (cleanedItem.isEmpty) {
      return;
    }

    if (!widget.suggestionsService.containsItem(
      cleanedItem,
      customItems: widget.customItems,
    )) {
      _selectItem(cleanedItem);
      return;
    }

    if (_items.length == 1) {
      _selectItem(_items.single);
    }
  }

  @override
  void dispose() {
    _searchController.removeListener(_handleSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final palette = context.appPalette;
    return Container(
      height: MediaQuery.sizeOf(context).height * 0.86,
      decoration: BoxDecoration(
        color: palette.surfaceSheet,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
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
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              'Itens cadastrados',
                              style: theme.textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Escolha um item ou digite um novo nome.',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: palette.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton.filledTonal(
                        onPressed: () => Navigator.of(context).pop(),
                        style: IconButton.styleFrom(
                          backgroundColor: palette.accentSoft,
                          foregroundColor: palette.accent,
                        ),
                        icon: const Icon(Icons.close_rounded),
                        tooltip: 'Fechar',
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    key: const ValueKey<String>('item-selector-search'),
                    controller: _searchController,
                    autofocus: true,
                    textInputAction: TextInputAction.search,
                    onSubmitted: _handleSearchSubmitted,
                    decoration: InputDecoration(
                      hintText: 'Buscar ou adicionar item...',
                      prefixIcon: const Icon(Icons.search_rounded),
                      filled: true,
                      fillColor: palette.surfaceMuted,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: _items.isEmpty
                  ? _EmptySelectorState(
                      query: _searchController.text,
                      onUseQuery: () => _selectItem(_searchController.text),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
                      itemCount: _items.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final item = _items[index];
                        return _ItemTile(
                          item: item,
                          onTap: () => _selectItem(item),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptySelectorState extends StatelessWidget {
  const _EmptySelectorState({required this.query, required this.onUseQuery});

  final String query;
  final VoidCallback onUseQuery;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final palette = context.appPalette;
    final normalizedQuery = query.trim();

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(Icons.search_off_rounded, color: palette.accent, size: 42),
            const SizedBox(height: 12),
            Text(
              'Nenhum item encontrado.',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w800,
              ),
            ),
            if (normalizedQuery.isNotEmpty) ...<Widget>[
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: onUseQuery,
                icon: const Icon(Icons.add_rounded),
                label: Text('Adicionar "$normalizedQuery"'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ItemTile extends StatelessWidget {
  const _ItemTile({required this.item, required this.onTap});

  final String item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final palette = context.appPalette;

    return Material(
      color: palette.surface,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: <Widget>[
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: palette.accentSoft,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  Icons.add_shopping_cart_rounded,
                  color: palette.accent,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  item,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              Icon(Icons.chevron_right_rounded, color: palette.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}

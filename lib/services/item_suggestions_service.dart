import 'package:shared_preferences/shared_preferences.dart';

import '../data/default_item_catalog.dart';

class ItemSuggestionsService {
  const ItemSuggestionsService();

  static const String _customItemsKey = 'custom_item_suggestions_v1';

  List<String> getDefaultItems() {
    return DefaultItemCatalog.names;
  }

  Future<List<String>> loadCustomItems() async {
    final preferences = await SharedPreferences.getInstance();
    final savedItems = preferences.getStringList(_customItemsKey);
    return _deduplicate(savedItems ?? const <String>[]);
  }

  Future<bool> saveCustomItem(String item) async {
    final cleanedItem = cleanItemName(item);
    if (cleanedItem.isEmpty) {
      return false;
    }

    final customItems = await loadCustomItems();
    if (_containsNormalized(DefaultItemCatalog.names, cleanedItem) ||
        _containsNormalized(customItems, cleanedItem)) {
      return false;
    }

    final updatedItems = <String>[
      ...customItems,
      cleanedItem,
    ]..sort((first, second) => _normalize(first).compareTo(_normalize(second)));
    final preferences = await SharedPreferences.getInstance();
    await preferences.setStringList(_customItemsKey, updatedItems);
    return true;
  }

  List<String> search(
    String query, {
    List<String> customItems = const <String>[],
    int limit = 500,
  }) {
    final items = _mergeItems(customItems);
    final normalizedQuery = _normalize(query);
    if (normalizedQuery.isEmpty) {
      return items.take(limit).toList(growable: false);
    }

    final startsWithMatches = <String>[];
    final containsMatches = <String>[];

    for (final item in items) {
      final normalizedItem = _normalize(item);
      if (normalizedItem.startsWith(normalizedQuery)) {
        startsWithMatches.add(item);
      } else if (normalizedItem.contains(normalizedQuery)) {
        containsMatches.add(item);
      }
    }

    return <String>[
      ...startsWithMatches,
      ...containsMatches,
    ].take(limit).toList(growable: false);
  }

  bool containsItem(
    String item, {
    List<String> customItems = const <String>[],
  }) {
    final cleanedItem = cleanItemName(item);
    if (cleanedItem.isEmpty) {
      return false;
    }

    return _containsNormalized(_mergeItems(customItems), cleanedItem);
  }

  String cleanItemName(String value) {
    return value.trim().replaceAll(RegExp(r'\s+'), ' ');
  }

  List<String> _mergeItems(List<String> customItems) {
    return _deduplicate(<String>[...DefaultItemCatalog.names, ...customItems]);
  }

  List<String> _deduplicate(List<String> items) {
    final seenItems = <String>{};
    final uniqueItems = <String>[];

    for (final item in items) {
      final cleanedItem = cleanItemName(item);
      if (cleanedItem.isEmpty) {
        continue;
      }

      if (seenItems.add(_normalize(cleanedItem))) {
        uniqueItems.add(cleanedItem);
      }
    }

    return uniqueItems;
  }

  bool _containsNormalized(List<String> items, String item) {
    final normalizedItem = _normalize(item);
    return items.any((candidate) => _normalize(candidate) == normalizedItem);
  }

  String _normalize(String value) {
    return value
        .trim()
        .toLowerCase()
        .replaceAll(RegExp(r'\s+'), ' ')
        .replaceAll('á', 'a')
        .replaceAll('à', 'a')
        .replaceAll('â', 'a')
        .replaceAll('ã', 'a')
        .replaceAll('ä', 'a')
        .replaceAll('é', 'e')
        .replaceAll('ê', 'e')
        .replaceAll('í', 'i')
        .replaceAll('ó', 'o')
        .replaceAll('ô', 'o')
        .replaceAll('õ', 'o')
        .replaceAll('ú', 'u')
        .replaceAll('ü', 'u')
        .replaceAll('ç', 'c');
  }
}

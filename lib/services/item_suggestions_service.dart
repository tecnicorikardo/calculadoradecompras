import '../data/default_item_catalog.dart';

class ItemSuggestionsService {
  const ItemSuggestionsService();

  List<String> getDefaultItems() {
    return DefaultItemCatalog.names;
  }

  List<String> search(String query, {int limit = 500}) {
    final normalizedQuery = _normalize(query);
    if (normalizedQuery.isEmpty) {
      return DefaultItemCatalog.names.take(limit).toList(growable: false);
    }

    final startsWithMatches = <String>[];
    final containsMatches = <String>[];

    for (final item in DefaultItemCatalog.names) {
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

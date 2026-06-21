import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../data/initial_shopping_items.dart';
import '../models/shopping_item.dart';
import '../models/shopping_session.dart';

class LocalStorageService {
  static const String _budgetLimitKey = 'budget_limit';
  static const String _itemsKey = 'shopping_items';
  static const String _initialItemsSeededKey = 'initial_items_seeded_v1';

  Future<ShoppingSession> loadSession() async {
    final preferences = await SharedPreferences.getInstance();
    final rawItems = await _loadOrSeedItems(preferences);

    return ShoppingSession(
      budgetLimit: preferences.getDouble(_budgetLimitKey),
      items: rawItems
          .map(
            (rawItem) => ShoppingItem.fromJson(
              jsonDecode(rawItem) as Map<String, dynamic>,
            ),
          )
          .toList(),
    );
  }

  Future<List<String>> _loadOrSeedItems(SharedPreferences preferences) async {
    final savedItems = preferences.getStringList(_itemsKey);
    final initialItemsSeeded =
        preferences.getBool(_initialItemsSeededKey) ?? false;

    if (initialItemsSeeded || (savedItems?.isNotEmpty ?? false)) {
      if (!initialItemsSeeded) {
        await preferences.setBool(_initialItemsSeededKey, true);
      }
      return savedItems ?? const <String>[];
    }

    final initialItems = InitialShoppingItems.create()
        .map((item) => jsonEncode(item.toJson()))
        .toList();

    await preferences.setStringList(_itemsKey, initialItems);
    await preferences.setBool(_initialItemsSeededKey, true);
    return initialItems;
  }

  Future<void> saveSession(ShoppingSession session) async {
    final preferences = await SharedPreferences.getInstance();

    await preferences.setStringList(
      _itemsKey,
      session.items.map((item) => jsonEncode(item.toJson())).toList(),
    );
    await preferences.setBool(_initialItemsSeededKey, true);

    if (session.budgetLimit == null) {
      await preferences.remove(_budgetLimitKey);
      return;
    }

    await preferences.setDouble(_budgetLimitKey, session.budgetLimit!);
  }
}

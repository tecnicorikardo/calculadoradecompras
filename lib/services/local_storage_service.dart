import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/shopping_item.dart';
import '../models/shopping_session.dart';

class LocalStorageService {
  static const String _budgetLimitKey = 'budget_limit';
  static const String _itemsKey = 'shopping_items';

  Future<ShoppingSession> loadSession() async {
    final preferences = await SharedPreferences.getInstance();
    final rawItems = preferences.getStringList(_itemsKey) ?? const <String>[];

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

  Future<void> saveSession(ShoppingSession session) async {
    final preferences = await SharedPreferences.getInstance();

    await preferences.setStringList(
      _itemsKey,
      session.items
          .map((item) => jsonEncode(item.toJson()))
          .toList(),
    );

    if (session.budgetLimit == null) {
      await preferences.remove(_budgetLimitKey);
      return;
    }

    await preferences.setDouble(_budgetLimitKey, session.budgetLimit!);
  }
}

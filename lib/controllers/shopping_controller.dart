import 'dart:collection';

import 'package:flutter/foundation.dart';

import '../models/budget_status.dart';
import '../models/shopping_item.dart';
import '../models/shopping_session.dart';
import '../services/local_storage_service.dart';

class ShoppingController extends ChangeNotifier {
  ShoppingController({required LocalStorageService storageService})
      : _storageService = storageService;

  static const double attentionThreshold = 0.85;

  final LocalStorageService _storageService;

  ShoppingSession _session = const ShoppingSession();
  bool _isLoading = true;

  bool get isLoading => _isLoading;
  double? get budgetLimit => _session.budgetLimit;
  ShoppingItem? get lastItem => _session.items.isEmpty ? null : _session.items.last;
  UnmodifiableListView<ShoppingItem> get items =>
      UnmodifiableListView<ShoppingItem>(_session.items);
  int get itemCount => _session.items.length;

  /// Agrupa itens por descrição + valor unitário.
  /// Itens sem descrição são agrupados apenas por valor.
  List<GroupedItem> get groupedItems {
    final map = <String, GroupedItem>{};
    for (final item in _session.items) {
      final key = '${item.description ?? ''}__${item.value}';
      if (map.containsKey(key)) {
        map[key] = map[key]!.copyWith(
          quantity: map[key]!.quantity + 1,
          ids: [...map[key]!.ids, item.id],
        );
      } else {
        map[key] = GroupedItem(
          description: item.description,
          unitValue: item.value,
          quantity: 1,
          ids: [item.id],
        );
      }
    }
    return map.values.toList();
  }

  double get total => _session.items.fold<double>(
        0,
        (sum, item) => sum + item.value,
      );

  double? get differenceToLimit {
    final limit = budgetLimit;
    if (limit == null) {
      return null;
    }
    return limit - total;
  }

  double get progressToLimit {
    final limit = budgetLimit;
    if (limit == null || limit <= 0) {
      return 0;
    }
    return (total / limit).clamp(0, 1.4).toDouble();
  }

  BudgetStatus get budgetStatus {
    final limit = budgetLimit;
    if (limit == null || limit <= 0) {
      return BudgetStatus.normal;
    }
    if (total > limit) {
      return BudgetStatus.exceeded;
    }
    if (total >= limit * attentionThreshold) {
      return BudgetStatus.attention;
    }
    return BudgetStatus.normal;
  }

  Future<void> load() async {
    _isLoading = true;
    notifyListeners();

    _session = await _storageService.loadSession();

    _isLoading = false;
    notifyListeners();
  }

  Future<void> setBudgetLimit(double? value) async {
    _session = _session.copyWith(budgetLimit: value);
    notifyListeners();
    await _persist();
  }

  Future<void> addItem(
    double value, {
    String? description,
  }) async {
    final updatedItems = <ShoppingItem>[
      ..._session.items,
      ShoppingItem.create(
        value: value,
        description: description,
      ),
    ];

    _session = _session.copyWith(items: updatedItems);
    notifyListeners();
    await _persist();
  }

  Future<void> removeItem(String id) async {
    final updatedItems = _session.items.where((item) => item.id != id).toList();
    _session = _session.copyWith(items: updatedItems);
    notifyListeners();
    await _persist();
  }

  Future<void> clearItems() async {
    _session = _session.copyWith(items: <ShoppingItem>[]);
    notifyListeners();
    await _persist();
  }

  Future<void> _persist() {
    return _storageService.saveSession(_session);
  }
}

class GroupedItem {
  const GroupedItem({
    required this.description,
    required this.unitValue,
    required this.quantity,
    required this.ids,
  });

  final String? description;
  final double unitValue;
  final int quantity;
  final List<String> ids;

  double get totalValue => unitValue * quantity;

  GroupedItem copyWith({
    int? quantity,
    List<String>? ids,
  }) {
    return GroupedItem(
      description: description,
      unitValue: unitValue,
      quantity: quantity ?? this.quantity,
      ids: ids ?? this.ids,
    );
  }
}

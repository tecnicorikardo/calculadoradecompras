import 'shopping_item.dart';

class ShoppingSession {
  const ShoppingSession({
    this.items = const <ShoppingItem>[],
    this.budgetLimit,
  });

  final List<ShoppingItem> items;
  final double? budgetLimit;

  ShoppingSession copyWith({
    List<ShoppingItem>? items,
    Object? budgetLimit = _sentinel,
  }) {
    return ShoppingSession(
      items: items ?? this.items,
      budgetLimit: identical(budgetLimit, _sentinel)
          ? this.budgetLimit
          : budgetLimit as double?,
    );
  }
}

const Object _sentinel = Object();

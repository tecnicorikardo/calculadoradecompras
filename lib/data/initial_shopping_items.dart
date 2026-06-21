import '../models/shopping_item.dart';

abstract final class InitialShoppingItems {
  static List<ShoppingItem> create() {
    return <ShoppingItem>[
      ShoppingItem.create(value: 30),
      ShoppingItem.create(value: 25.20),
      ShoppingItem.create(value: 15.30, description: 'Arroz'),
    ];
  }
}

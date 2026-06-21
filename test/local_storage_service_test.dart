import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:calculadora/models/shopping_item.dart';
import 'package:calculadora/models/shopping_session.dart';
import 'package:calculadora/services/local_storage_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('LocalStorageService', () {
    test('adiciona a lista inicial apenas uma vez', () async {
      SharedPreferences.setMockInitialValues(<String, Object>{});
      final service = LocalStorageService();

      final firstSession = await service.loadSession();
      final secondSession = await service.loadSession();

      expect(firstSession.items, hasLength(3));
      expect(firstSession.items.map((item) => item.value), <double>[
        30,
        25.20,
        15.30,
      ]);
      expect(firstSession.items.last.description, 'Arroz');
      expect(
        secondSession.items.map((item) => item.id),
        firstSession.items.map((item) => item.id),
      );
    });

    test('preserva uma lista existente', () async {
      final existingItem = ShoppingItem.create(
        value: 8.42,
        description: 'Feijão',
      );
      SharedPreferences.setMockInitialValues(<String, Object>{});
      final service = LocalStorageService();

      await service.saveSession(
        ShoppingSession(items: <ShoppingItem>[existingItem]),
      );
      final session = await service.loadSession();

      expect(session.items, hasLength(1));
      expect(session.items.single.description, 'Feijão');
      expect(session.items.single.value, 8.42);
    });

    test('não recria a lista inicial depois que ela é limpa', () async {
      SharedPreferences.setMockInitialValues(<String, Object>{});
      final service = LocalStorageService();

      await service.loadSession();
      await service.saveSession(const ShoppingSession());
      final session = await service.loadSession();

      expect(session.items, isEmpty);
    });
  });
}

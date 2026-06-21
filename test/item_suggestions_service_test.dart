import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:calculadora/services/item_suggestions_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('ItemSuggestionsService', () {
    const service = ItemSuggestionsService();

    test('carrega catalogo recuperado do app de referencia', () {
      final items = service.getDefaultItems();

      expect(items.length, greaterThan(300));
      expect(items, contains('Arroz Agulhinha'));
      expect(items, contains('Feijão Carioca'));
      expect(items, contains('Peito de Frango'));
      expect(items, contains('Filtro de Papel'));
    });

    test('busca ignorando acentos', () {
      expect(service.search('feijao'), contains('Feijão Carioca'));
      expect(service.search('acucar'), contains('Açúcar Cristal'));
      expect(service.search('macarrao'), contains('Macarrão Instantâneo'));
    });

    test('salva item personalizado e inclui na busca', () async {
      SharedPreferences.setMockInitialValues(<String, Object>{});

      final saved = await service.saveCustomItem('  Granola  Especial  ');
      final customItems = await service.loadCustomItems();

      expect(saved, isTrue);
      expect(customItems, <String>['Granola Especial']);
      expect(service.search('granola', customItems: customItems), <String>[
        'Granola Especial',
      ]);
    });

    test(
      'nao duplica item ja cadastrado no catalogo ou personalizados',
      () async {
        SharedPreferences.setMockInitialValues(<String, Object>{});

        expect(await service.saveCustomItem('Arroz Agulhinha'), isFalse);
        expect(await service.saveCustomItem('Granola Especial'), isTrue);
        expect(await service.saveCustomItem('granola especial'), isFalse);
        expect(await service.loadCustomItems(), <String>['Granola Especial']);
      },
    );
  });
}

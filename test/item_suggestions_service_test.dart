import 'package:flutter_test/flutter_test.dart';

import 'package:calculadora/services/item_suggestions_service.dart';

void main() {
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
  });
}

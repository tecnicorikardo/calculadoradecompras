# Soma Rapida

Aplicativo Flutter para somar valores de produtos em tempo real enquanto a pessoa compra em mercado, feira ou loja.

## O que o app faz

- Define um limite de gasto opcional
- Soma produtos rapidamente com campo unico de valor
- Mostra total atual, quantidade de itens e status do limite
- Alerta quando estiver perto do limite ou quando ultrapassar
- Abre uma lista dos itens adicionados pelo botao flutuante
- Permite remover itens individualmente ou limpar toda a lista
- Salva itens e limite localmente com `shared_preferences`

## Estrutura de pastas

```text
lib/
  app.dart
  main.dart
  controllers/
    shopping_controller.dart
  core/
    theme/
      app_theme.dart
    utils/
      currency_formatters.dart
      currency_input_parser.dart
  models/
    budget_status.dart
    shopping_item.dart
    shopping_session.dart
  screens/
    shopping_screen.dart
  services/
    local_storage_service.dart
  widgets/
    items_bottom_sheet.dart
    money_input_field.dart
    summary_card.dart
```

## Como executar

1. Rode `flutter pub get`
2. Inicie com `flutter run`

## Dependencias principais

- `intl`
- `shared_preferences`

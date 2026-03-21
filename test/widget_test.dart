import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:calculadora/app.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  void configurePhoneViewport(WidgetTester tester) {
    tester.view.physicalSize = const Size(375, 812);
    tester.view.devicePixelRatio = 1.0;
  }

  void resetViewport(WidgetTester tester) {
    tester.view.resetPhysicalSize();
    tester.view.resetDevicePixelRatio();
  }

  testWidgets('adiciona item com descricao e mascara monetaria automatica', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues(<String, Object>{});
    configurePhoneViewport(tester);
    addTearDown(() => resetViewport(tester));

    await tester.pumpWidget(const QuickSumApp());
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byKey(const ValueKey<String>('description-field')),
      'Maca',
    );

    await tester.ensureVisible(find.byKey(const ValueKey<String>('numpad-1')));
    await tester.pumpAndSettle();

    await tester.tap(
      find.byKey(const ValueKey<String>('numpad-1')),
      warnIfMissed: false,
    );
    await tester.pump();
    await tester.tap(
      find.byKey(const ValueKey<String>('numpad-2')),
      warnIfMissed: false,
    );
    await tester.pump();
    await tester.tap(
      find.byKey(const ValueKey<String>('numpad-5')),
      warnIfMissed: false,
    );
    await tester.pump();
    await tester.tap(
      find.byKey(const ValueKey<String>('numpad-0')),
      warnIfMissed: false,
    );
    await tester.pumpAndSettle();

    expect(find.textContaining('12,50'), findsWidgets);

    await tester.tap(
      find.byKey(const ValueKey<String>('numpad-add')),
      warnIfMissed: false,
    );
    await tester.pumpAndSettle();

    expect(find.text('Ultimo Item'), findsOneWidget);
    expect(find.text('Maca'), findsWidgets);
    expect(find.textContaining('12,50'), findsWidgets);
  });

  testWidgets('abre menu do botao flutuante com opcao de compartilhar', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues(<String, Object>{});
    configurePhoneViewport(tester);
    addTearDown(() => resetViewport(tester));

    await tester.pumpWidget(const QuickSumApp());
    await tester.pumpAndSettle();

    await tester.tap(
      find.byTooltip('Opcoes da lista'),
      warnIfMissed: false,
    );
    await tester.pumpAndSettle();

    expect(find.text('Ver lista'), findsOneWidget);
    expect(find.text('Compartilhar'), findsOneWidget);
  });
}

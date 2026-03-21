import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';

import '../controllers/shopping_controller.dart';
import '../core/config/app_info.dart';
import '../core/theme/app_palette.dart';
import '../core/utils/currency_formatters.dart';
import '../core/utils/currency_input_parser.dart';
import '../models/budget_status.dart';
import '../services/local_storage_service.dart';
import '../widgets/items_bottom_sheet.dart';
import '../widgets/numeric_keypad.dart';

class ShoppingScreen extends StatefulWidget {
  const ShoppingScreen({
    super.key,
    required this.themeMode,
    required this.onThemeModeChanged,
  });

  final ThemeMode themeMode;
  final ValueChanged<ThemeMode> onThemeModeChanged;

  @override
  State<ShoppingScreen> createState() => _ShoppingScreenState();
}

class _SettingsSection extends StatelessWidget {
  const _SettingsSection({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final palette = context.appPalette;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: palette.border),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: palette.shadow,
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            title,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _SettingsActionTile extends StatelessWidget {
  const _SettingsActionTile({
    required this.icon,
    required this.title,
    required this.value,
    required this.actionLabel,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String value;
  final String actionLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final palette = context.appPalette;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: palette.surfaceMuted,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: <Widget>[
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: palette.accentSoft,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: palette.accent),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  title,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: palette.textSecondary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  value,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: onTap,
            style: TextButton.styleFrom(foregroundColor: palette.accent),
            child: Text(actionLabel),
          ),
        ],
      ),
    );
  }
}

class _SettingsInfoRow extends StatelessWidget {
  const _SettingsInfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final palette = context.appPalette;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: palette.surfaceMuted,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: palette.textSecondary,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Text(
            value,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

enum _AmountFieldTarget { budget, product }

class _ShoppingScreenState extends State<ShoppingScreen>
    with SingleTickerProviderStateMixin {
  late final ShoppingController _controller;
  late final AnimationController _budgetAlertPulseController;
  final TextEditingController _budgetController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _productController = TextEditingController();
  final FocusNode _budgetFocusNode = FocusNode();
  final FocusNode _descriptionFocusNode = FocusNode();

  String? _budgetError;
  _AmountFieldTarget _activeAmountField = _AmountFieldTarget.product;

  @override
  void initState() {
    super.initState();
    _budgetAlertPulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _budgetFocusNode.addListener(_handleBudgetFocusChange);
    _descriptionFocusNode.addListener(_handleDescriptionFocusChange);
    _controller = ShoppingController(storageService: LocalStorageService());
    _controller.addListener(_handleBudgetAlertStateChanged);
    _syncBudgetAlertPulse();
    _initialize();
  }

  void _handleBudgetAlertStateChanged() {
    _syncBudgetAlertPulse();
  }

  bool get _limitReached {
    final limit = _controller.budgetLimit;
    return limit != null && _controller.total >= limit;
  }

  bool get _shouldPulseBudgetAlert {
    return _controller.budgetLimit != null && _limitReached;
  }

  void _syncBudgetAlertPulse() {
    if (_shouldPulseBudgetAlert) {
      if (!_budgetAlertPulseController.isAnimating) {
        _budgetAlertPulseController.repeat(reverse: true);
      }
      return;
    }

    if (_budgetAlertPulseController.isAnimating ||
        _budgetAlertPulseController.value != 0) {
      _budgetAlertPulseController.stop();
      _budgetAlertPulseController.value = 0;
    }
  }

  void _handleBudgetFocusChange() {
    if (!_budgetFocusNode.hasFocus) {
      return;
    }

    if (_activeAmountField == _AmountFieldTarget.budget &&
        _budgetError == null) {
      return;
    }

    setState(() {
      _budgetError = null;
      _activeAmountField = _AmountFieldTarget.budget;
    });
  }

  void _handleDescriptionFocusChange() {
    if (!_descriptionFocusNode.hasFocus) {
      return;
    }

    if (_activeAmountField == _AmountFieldTarget.product) {
      return;
    }

    setState(() {
      _activeAmountField = _AmountFieldTarget.product;
    });
  }

  Future<void> _initialize() async {
    await _controller.load();
    if (!mounted) {
      return;
    }

    final limit = _controller.budgetLimit;
    if (limit != null && limit <= 9999999.99) {
      _budgetController.text = CurrencyFormatters.formatEditable(limit);
    } else if (limit != null && limit > 9999999.99) {
      // Valor corrompido no storage — limpa
      await _controller.setBudgetLimit(null);
    }

    setState(() {});
  }

  Future<void> _applyBudgetLimit() async {
    final input = _budgetController.text;
    if (input.trim().isEmpty) {
      setState(() => _budgetError = null);
      await _controller.setBudgetLimit(null);
      return;
    }

    final value = CurrencyInputParser.parse(input);
    if (value == null || value <= 0) {
      setState(() {
        _budgetError = 'Informe um limite maior que zero.';
      });
      return;
    }

    setState(() {
      _budgetError = null;
      _budgetController.text = CurrencyFormatters.formatEditable(value);
      _budgetController.selection = TextSelection.fromPosition(
        TextPosition(offset: _budgetController.text.length),
      );
    });

    await _controller.setBudgetLimit(value);
  }

  void _activateBudgetField() {
    if (!_budgetFocusNode.hasFocus) {
      _budgetFocusNode.requestFocus();
    }

    if (_activeAmountField == _AmountFieldTarget.budget &&
        _budgetError == null) {
      return;
    }

    setState(() {
      _budgetError = null;
      _activeAmountField = _AmountFieldTarget.budget;
    });
  }

  void _handleBudgetChanged(String _) {
    if (_activeAmountField == _AmountFieldTarget.budget &&
        _budgetError == null) {
      return;
    }

    setState(() {
      _budgetError = null;
      _activeAmountField = _AmountFieldTarget.budget;
    });
  }

  Future<void> _confirmBudgetLimit() async {
    await _applyBudgetLimit();
    if (!mounted) {
      return;
    }

    if (_budgetError != null) {
      _showMessage(_budgetError!);
      _budgetFocusNode.requestFocus();
      return;
    }

    FocusScope.of(context).unfocus();
    setState(() {
      _activeAmountField = _AmountFieldTarget.product;
    });
  }

  Future<void> _selectAmountField(_AmountFieldTarget target) async {
    FocusScope.of(context).unfocus();
    if (_activeAmountField == _AmountFieldTarget.budget &&
        target != _AmountFieldTarget.budget) {
      await _applyBudgetLimit();
    }
    if (!mounted) {
      return;
    }
    setState(() {
      if (target == _AmountFieldTarget.budget) {
        _budgetError = null;
      }
      _activeAmountField = target;
    });
  }

  TextEditingController get _activeAmountController {
    return _activeAmountField == _AmountFieldTarget.budget
        ? _budgetController
        : _productController;
  }

  void _appendDigit(String digit) {
    FocusScope.of(context).unfocus();
    final digits = _extractDigits(_activeAmountController.text) + digit;
    _updateAmountValue(digits);
  }

  void _backspaceValue() {
    FocusScope.of(context).unfocus();
    final digits = _extractDigits(_activeAmountController.text);
    if (digits.isEmpty) {
      return;
    }
    _updateAmountValue(digits.substring(0, digits.length - 1));
  }

  void _clearValue() {
    FocusScope.of(context).unfocus();
    setState(() {
      if (_activeAmountField == _AmountFieldTarget.budget) {
        _budgetError = null;
        _budgetController.clear();
      } else {
        _productController.clear();
      }
    });
  }

  void _updateAmountValue(String digits) {
    // Limita a 10 dígitos para evitar valores absurdos (máx R$ 99.999.999,99)
    if (digits.length > 10) return;
    setState(() {
      final controller = _activeAmountController;
      if (_activeAmountField == _AmountFieldTarget.budget) {
        _budgetError = null;
      }
      if (digits.isEmpty) {
        controller.clear();
        return;
      }

      final cents = int.parse(digits);
      controller.text = CurrencyFormatters.formatAmount(cents / 100);
      controller.selection = TextSelection.fromPosition(
        TextPosition(offset: controller.text.length),
      );
    });
  }

  String _extractDigits(String raw) {
    return raw.replaceAll(RegExp(r'[^0-9]'), '');
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  String _buildShareText() {
    final lines = <String>[
      'Lista de compras - Soma Facil',
      'Total: ${CurrencyFormatters.brl.format(_controller.total)}',
      'Itens: ${_controller.itemCount}',
    ];

    if (_controller.budgetLimit != null) {
      lines.add(
        'Limite: ${CurrencyFormatters.brl.format(_controller.budgetLimit!)}',
      );
      final difference = _controller.differenceToLimit;
      if (difference != null) {
        if (difference >= 0) {
          lines.add('Restante: ${CurrencyFormatters.brl.format(difference)}');
        } else {
          lines.add(
            'Excedeu: ${CurrencyFormatters.brl.format(difference.abs())}',
          );
        }
      }
    }

    lines.add('');

    for (var index = 0; index < _controller.items.length; index++) {
      final item = _controller.items[index];
      final description = item.description ?? 'Item ${index + 1}';
      lines.add(
        '${index + 1}. $description - ${CurrencyFormatters.brl.format(item.value)}',
      );
    }

    return lines.join('\n');
  }

  Future<void> _shareList() async {
    if (_controller.itemCount == 0) {
      _showMessage('Adicione itens antes de compartilhar a lista.');
      return;
    }

    await Share.share(
      _buildShareText(),
      subject: 'Lista de compras - Soma Facil',
    );
  }

  Future<void> _handleAddItem() async {
    FocusManager.instance.primaryFocus?.unfocus();
    await _applyBudgetLimit();
    if (_budgetError != null) {
      _showMessage(_budgetError!);
      return;
    }

    final input = _productController.text;
    if (input.trim().isEmpty) {
      _showMessage('Digite o valor do produto para continuar.');
      return;
    }

    final value = CurrencyInputParser.parse(input);
    if (value == null || value <= 0) {
      _showMessage('Use o teclado numerico para montar um valor valido.');
      return;
    }

    await _controller.addItem(value, description: _descriptionController.text);

    await _applyBudgetLimit();
    _descriptionController.clear();
    _productController.clear();

    if (!mounted) {
      return;
    }

    setState(() {
      _activeAmountField = _AmountFieldTarget.product;
    });
  }

  Future<void> _confirmClearAll() async {
    if (_controller.itemCount == 0) {
      Navigator.of(context).pop();
      return;
    }

    final shouldClear =
        await showDialog<bool>(
          context: context,
          builder: (context) {
            return AlertDialog(
              title: const Text('Limpar todos os itens?'),
              content: const Text(
                'Isso apaga a lista atual, mas o limite de gasto continua salvo.',
              ),
              actions: <Widget>[
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Cancelar'),
                ),
                FilledButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Limpar tudo'),
                ),
              ],
            );
          },
        ) ??
        false;

    if (!shouldClear || !mounted) {
      return;
    }

    await _controller.clearItems();
    if (mounted) {
      Navigator.of(context).pop();
    }
  }

  Future<void> _showItemsSheet() {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return ItemsBottomSheet(
          controller: _controller,
          onClearAll: _confirmClearAll,
          onShare: () {
            Navigator.of(context).pop();
            _shareList();
          },
        );
      },
    );
  }

  Future<void> _handleFloatingAction() async {
    await _showItemsSheet();
  }

  Future<void> _copyToClipboard({
    required String label,
    required String value,
  }) async {
    await Clipboard.setData(ClipboardData(text: value));
    if (!mounted) {
      return;
    }
    _showMessage('$label copiado.');
  }

  Future<void> _showSettingsSheet() {
    var selectedThemeMode = widget.themeMode;

    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        final theme = Theme.of(context);
        final palette = context.appPalette;

        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              decoration: BoxDecoration(
                color: palette.surfaceSheet,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(30),
                ),
              ),
              child: SafeArea(
                top: false,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Center(
                        child: Container(
                          width: 46,
                          height: 5,
                          decoration: BoxDecoration(
                            color: palette.handle,
                            borderRadius: BorderRadius.circular(99),
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      Row(
                        children: <Widget>[
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  'Configuracoes',
                                  style: theme.textTheme.headlineSmall
                                      ?.copyWith(fontWeight: FontWeight.w800),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Personalize a tela e veja os dados do app.',
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: palette.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton.filledTonal(
                            onPressed: () => Navigator.of(context).pop(),
                            icon: const Icon(Icons.close_rounded),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      _SettingsSection(
                        title: 'Tema',
                        child: SegmentedButton<ThemeMode>(
                          showSelectedIcon: false,
                          segments: const <ButtonSegment<ThemeMode>>[
                            ButtonSegment<ThemeMode>(
                              value: ThemeMode.light,
                              icon: Icon(Icons.light_mode_rounded),
                              label: Text('Claro'),
                            ),
                            ButtonSegment<ThemeMode>(
                              value: ThemeMode.dark,
                              icon: Icon(Icons.dark_mode_rounded),
                              label: Text('Escuro'),
                            ),
                          ],
                          selected: <ThemeMode>{selectedThemeMode},
                          onSelectionChanged: (selection) {
                            final themeMode = selection.first;
                            setModalState(() => selectedThemeMode = themeMode);
                            widget.onThemeModeChanged(themeMode);
                          },
                        ),
                      ),
                      const SizedBox(height: 16),
                      _SettingsSection(
                        title: 'Contato',
                        child: Column(
                          children: <Widget>[
                            _SettingsActionTile(
                              icon: Icons.alternate_email_rounded,
                              title: 'Email',
                              value: AppInfo.supportEmail,
                              actionLabel: 'Copiar',
                              onTap: () {
                                _copyToClipboard(
                                  label: 'Email',
                                  value: AppInfo.supportEmail,
                                );
                              },
                            ),
                            const SizedBox(height: 10),
                            _SettingsActionTile(
                              icon: Icons.phone_rounded,
                              title: 'Telefone',
                              value: AppInfo.supportPhone,
                              actionLabel: 'Copiar',
                              onTap: () {
                                _copyToClipboard(
                                  label: 'Telefone',
                                  value: AppInfo.supportPhone,
                                );
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      _SettingsSection(
                        title: 'Aplicativo',
                        child: Column(
                          children: <Widget>[
                            _SettingsInfoRow(
                              label: 'Nome',
                              value: AppInfo.appName,
                            ),
                            const SizedBox(height: 10),
                            _SettingsInfoRow(
                              label: 'Versao',
                              value: AppInfo.appVersion,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  bool get _showAlertTitle {
    return _controller.budgetStatus != BudgetStatus.normal &&
        _controller.budgetLimit != null;
  }

  String get _budgetAlertHeadline {
    if (!_showAlertTitle) {
      return '';
    }

    if (_limitReached) {
      return _controller.total > (_controller.budgetLimit ?? 0)
          ? 'Limite excedido'
          : 'Limite atingido';
    }

    return 'Atencao ao limite';
  }

  String get _budgetAlertBadgeLabel {
    if (_limitReached) {
      return _controller.total > (_controller.budgetLimit ?? 0)
          ? 'Acima do limite'
          : 'Limite atingido';
    }

    return 'Quase no limite';
  }

  Color _budgetAlertColor(AppPalette palette) {
    if (_limitReached || _controller.budgetStatus == BudgetStatus.exceeded) {
      return palette.accentStrong;
    }

    return palette.warning;
  }

  BoxDecoration _glowCardDecoration({
    required bool compact,
    required bool tight,
    bool outlined = false,
    bool active = false,
  }) {
    final palette = context.appPalette;

    return BoxDecoration(
      color: palette.surface,
      borderRadius: BorderRadius.circular(
        tight
            ? 18
            : compact
            ? 22
            : 28,
      ),
      border: Border.all(
        color: outlined
            ? active
                  ? palette.accent
                  : palette.border
            : palette.border.withValues(alpha: 0.72),
        width: outlined
            ? active
                  ? 1.8
                  : 1.2
            : 1,
      ),
      boxShadow: <BoxShadow>[
        BoxShadow(
          color: palette.shadow,
          blurRadius: tight
              ? 12
              : compact
              ? 18
              : 24,
          offset: Offset(
            0,
            tight
                ? 6
                : compact
                ? 10
                : 14,
          ),
        ),
      ],
    );
  }

  Widget _buildHeader(bool compact, bool tight) {
    final palette = context.appPalette;
    final alertColor = _budgetAlertColor(palette);

    return Row(
      children: <Widget>[
        Expanded(
          child: Row(
            children: <Widget>[
              Flexible(
                child: Text(
                  AppInfo.appName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: palette.accentStrong,
                    fontSize: tight
                        ? 17
                        : compact
                        ? 19
                        : 28,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.4,
                  ),
                ),
              ),
              if (_showAlertTitle) ...<Widget>[
                SizedBox(
                  width: tight
                      ? 6
                      : compact
                      ? 8
                      : 16,
                ),
                Expanded(
                  child: Text(
                    _budgetAlertHeadline,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: alertColor,
                      fontSize: tight
                          ? 14
                          : compact
                          ? 16
                          : 24,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.2,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
        SizedBox(width: tight ? 8 : 12),
        IconButton.filledTonal(
          onPressed: _showSettingsSheet,
          icon: Icon(Icons.tune_rounded, size: tight ? 18 : 22),
          style: IconButton.styleFrom(
            backgroundColor: palette.accentSoft,
            foregroundColor: palette.accent,
            minimumSize: Size.square(tight ? 38 : 44),
          ),
        ),
      ],
    );
  }

  Widget _buildLimitCard(bool compact, bool tight) {
    final palette = context.appPalette;
    final hasLimit = _budgetController.text.trim().isNotEmpty;
    final active = _activeAmountField == _AmountFieldTarget.budget;
    final labelFontSize = tight ? 9.0 : compact ? 10.0 : 13.0;
    final badgeFontSize = tight ? 7.0 : compact ? 8.0 : 10.0;
    final valueFontSize = tight ? 16.0 : compact ? 18.0 : 22.0;
    final actionSize = tight ? 30.0 : compact ? 34.0 : 40.0;
    final fieldColor = active || hasLimit
        ? palette.accentStrong
        : palette.textSecondary;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: tight ? 10 : compact ? 12 : 16,
        vertical: tight ? 4 : compact ? 6 : 8,
      ),
      decoration: _glowCardDecoration(
        compact: compact,
        tight: tight,
        outlined: true,
        active: active,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          // Label + badge empilhados verticalmente à esquerda
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Row(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Text(
                    'Limite de Compra',
                    style: TextStyle(
                      color: palette.textSecondary,
                      fontSize: labelFontSize,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(width: tight ? 4 : 6),
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: tight ? 5 : 7,
                      vertical: tight ? 1 : 2,
                    ),
                    decoration: BoxDecoration(
                      color: palette.accentSoft,
                      borderRadius: BorderRadius.circular(99),
                    ),
                    child: Text(
                      'Opcional',
                      style: TextStyle(
                        color: palette.accent,
                        fontSize: badgeFontSize,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          SizedBox(width: tight ? 8 : 10),
          // Campo de valor ocupa o espaço restante
          Expanded(
            child: TextField(
              key: const ValueKey<String>('budget-field'),
              controller: _budgetController,
              focusNode: _budgetFocusNode,
              keyboardType: TextInputType.none,
              readOnly: true,
              showCursor: true,
              maxLines: 1,
              onTap: _activateBudgetField,
              onChanged: _handleBudgetChanged,
              textAlign: TextAlign.right,
              style: TextStyle(
                color: fieldColor,
                fontSize: valueFontSize,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.3,
              ),
              cursorColor: palette.accent,
              decoration: InputDecoration(
                filled: false,
                isCollapsed: true,
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                disabledBorder: InputBorder.none,
                errorBorder: InputBorder.none,
                focusedErrorBorder: InputBorder.none,
                contentPadding: EdgeInsets.zero,
                hintText: 'R\$ 0,00',
                hintStyle: TextStyle(
                  color: palette.textSecondary,
                  fontSize: valueFontSize,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          SizedBox(width: tight ? 6 : 8),
          Tooltip(
            message: 'Aplicar limite',
            child: IconButton.filled(
              onPressed: _confirmBudgetLimit,
              icon: Icon(
                Icons.check_rounded,
                size: tight ? 16 : compact ? 18 : 20,
              ),
              style: IconButton.styleFrom(
                backgroundColor: palette.accent,
                foregroundColor: palette.accentForeground,
                minimumSize: Size.square(actionSize),
                padding: EdgeInsets.zero,
              ),
            ),
          ),
        ],
      ),
    );
  }

  BoxDecoration _buildAlertTotalCardDecoration({
    required bool compact,
    required bool tight,
    required BudgetStatus status,
    required double pulse,
  }) {
    final palette = context.appPalette;
    final baseDecoration = _glowCardDecoration(compact: compact, tight: tight);
    if (status == BudgetStatus.normal) {
      return baseDecoration;
    }

    final alertColor = _budgetAlertColor(palette);
    final glowPulse = _shouldPulseBudgetAlert ? pulse : 0.3;
    final isCritical = _limitReached || status == BudgetStatus.exceeded;

    return baseDecoration.copyWith(
      color: Color.alphaBlend(
        alertColor.withValues(alpha: isCritical ? 0.08 : 0.05),
        palette.surface,
      ),
      border: Border.all(
        color: alertColor.withValues(alpha: isCritical ? 0.94 : 0.72),
        width: isCritical ? 1.6 + (glowPulse * 1.2) : 1.2 + (glowPulse * 0.6),
      ),
      boxShadow: <BoxShadow>[
        ...?baseDecoration.boxShadow,
        BoxShadow(
          color: alertColor.withValues(
            alpha: isCritical
                ? 0.18 + (glowPulse * 0.14)
                : 0.10 + (glowPulse * 0.08),
          ),
          blurRadius: tight
              ? 16 + (glowPulse * 10)
              : compact
              ? 20 + (glowPulse * 12)
              : 28 + (glowPulse * 14),
          spreadRadius:
              glowPulse *
              (tight
                  ? 0.4
                  : compact
                  ? 0.7
                  : 1.0),
        ),
      ],
    );
  }

  Widget _buildBudgetAlertBadge({
    required bool compact,
    required bool tight,
    required Color alertColor,
    required double pulse,
    bool condensed = false,
  }) {
    final scale = _shouldPulseBudgetAlert ? 1 + (pulse * 0.06) : 1.0;

    return Transform.scale(
      scale: scale,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: condensed
              ? tight
                    ? 6
                    : 8
              : tight
              ? 8
              : compact
              ? 10
              : 12,
          vertical: condensed
              ? tight
                    ? 3
                    : 4
              : tight
              ? 4
              : compact
              ? 5
              : 6,
        ),
        decoration: BoxDecoration(
          color: alertColor.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: alertColor.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(
              _limitReached
                  ? Icons.priority_high_rounded
                  : Icons.warning_amber_rounded,
              color: alertColor,
              size: condensed
                  ? tight
                        ? 11
                        : 12
                  : tight
                  ? 14
                  : compact
                  ? 16
                  : 18,
            ),
            SizedBox(
              width: condensed
                  ? 4
                  : tight
                  ? 4
                  : compact
                  ? 5
                  : 6,
            ),
            Text(
              _budgetAlertBadgeLabel,
              style: TextStyle(
                color: alertColor,
                fontSize: condensed
                    ? tight
                          ? 8.5
                          : 9.5
                    : tight
                    ? 10
                    : compact
                    ? 11
                    : 13,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.1,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTotalCard(bool compact, bool tight, {bool condensed = false}) {
    final palette = context.appPalette;
    final totalText = CurrencyFormatters.brl.format(_controller.total);
    final status = _controller.budgetStatus;
    final alert = _showAlertTitle;
    final alertColor = _budgetAlertColor(palette);
    final totalColor = _limitReached || status == BudgetStatus.exceeded
        ? palette.accentStrong
        : status == BudgetStatus.attention
        ? palette.warning
        : palette.accentStrong;
    final horizontalPadding = condensed
        ? tight
              ? 8.0
              : 10.0
        : tight
        ? 10.0
        : compact
        ? 12.0
        : 16.0;
    final verticalPadding = condensed
        ? tight
              ? 6.0
              : 8.0
        : tight
        ? 4.0
        : compact
        ? 6.0
        : 8.0;
    final titleFontSize = condensed
        ? tight
              ? 11.0
              : 12.0
        : tight
        ? 12.0
        : compact
        ? 14.0
        : 20.0;
    final totalFontSize = condensed
        ? tight
              ? 34.0
              : 40.0
        : tight
        ? 60.0
        : compact
        ? 64.0
        : 70.0;
    final showTotalAlertIcon = alert && !condensed;

    return AnimatedBuilder(
      animation: _budgetAlertPulseController,
      builder: (context, _) {
        final pulse = Curves.easeInOut.transform(
          _budgetAlertPulseController.value,
        );

        return Container(
          width: double.infinity,
          decoration: _buildAlertTotalCardDecoration(
            compact: compact,
            tight: tight,
            status: status,
            pulse: pulse,
          ),
          padding: EdgeInsets.symmetric(
            horizontal: horizontalPadding,
            vertical: verticalPadding,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: <Widget>[
              Text(
                'Total',
                style: TextStyle(
                  color: palette.textPrimary,
                  fontSize: titleFontSize,
                  fontWeight: FontWeight.w700,
                ),
              ),
              if (alert) ...<Widget>[
                SizedBox(
                  height: condensed
                      ? tight
                            ? 2
                            : 3
                      : tight
                      ? 3
                      : compact
                      ? 4
                      : 6,
                ),
                _buildBudgetAlertBadge(
                  compact: compact,
                  tight: tight,
                  alertColor: alertColor,
                  pulse: pulse,
                  condensed: condensed,
                ),
              ],
              SizedBox(
                height: condensed
                    ? alert
                          ? 4
                          : 2
                    : alert
                    ? tight
                          ? 4
                          : compact
                          ? 6
                          : 8
                    : tight
                    ? 2
                    : compact
                    ? 4
                    : 6,
              ),
              Expanded(
                child: Center(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: <Widget>[
                        if (showTotalAlertIcon) ...<Widget>[
                          Transform.scale(
                            scale:
                                1 +
                                (_shouldPulseBudgetAlert ? pulse * 0.18 : 0.06),
                            child: Icon(
                              Icons.warning_amber_rounded,
                              color: alertColor,
                              size: tight
                                  ? 32
                                  : compact
                                  ? 40
                                  : 54,
                            ),
                          ),
                          SizedBox(
                            width: tight
                                ? 6
                                : compact
                                ? 8
                                : 10,
                          ),
                        ],
                        Text(
                          totalText,
                          style: TextStyle(
                            color: totalColor,
                            fontSize: totalFontSize,
                            fontWeight: FontWeight.w900,
                            letterSpacing: condensed
                                ? -0.6
                                : tight
                                ? -1.0
                                : -1.2,
                            shadows: <Shadow>[
                              Shadow(
                                color: totalColor.withValues(
                                  alpha: _limitReached ? 0.42 : 0.3,
                                ),
                                blurRadius: tight
                                    ? 12
                                    : compact
                                    ? 14
                                    : 18,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLastItemCard(bool compact, bool tight, {bool condensed = false}) {
    final palette = context.appPalette;
    final lastItem = _controller.lastItem;

    // Encontra o grupo correspondente ao último item para mostrar quantidade
    GroupedItem? lastGroup;
    if (lastItem != null) {
      final key = '${lastItem.description ?? ''}__${lastItem.value}';
      for (final g in _controller.groupedItems) {
        if ('${g.description ?? ''}__${g.unitValue}' == key) {
          lastGroup = g;
          break;
        }
      }
    }

    final qty = lastGroup?.quantity ?? 1;
    final rawDescription = lastItem?.description ?? 'Nenhum item adicionado';
    final description = (lastItem != null && qty > 1)
        ? '${qty}x $rawDescription'
        : rawDescription;
    final value = lastItem == null
        ? 'R\$ 0,00'
        : qty > 1
            ? '${qty} x ${CurrencyFormatters.brl.format(lastItem.value)} = ${CurrencyFormatters.brl.format(lastItem.value * qty)}'
            : CurrencyFormatters.brl.format(lastItem.value);
    final descriptionColor = lastItem == null
        ? palette.textSecondary
        : palette.textPrimary;
    final valueColor = lastItem == null
        ? palette.textSecondary
        : palette.accentStrong;

    return Container(
      width: double.infinity,
      decoration: _glowCardDecoration(compact: compact, tight: tight),
      padding: EdgeInsets.symmetric(
        horizontal: condensed
            ? tight
                  ? 10
                  : 12
            : tight
            ? 12
            : compact
            ? 14
            : 18,
        vertical: condensed
            ? tight
                  ? 6
                  : 8
            : tight
            ? 7
            : compact
            ? 9
            : 10,
      ),
      child: condensed
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Ultimo item',
                  style: TextStyle(
                    color: palette.textSecondary,
                    fontSize: tight ? 9 : 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: tight ? 4 : 6),
                Expanded(
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: descriptionColor,
                        fontSize: tight ? 11 : 12,
                        fontWeight: FontWeight.w800,
                        height: 1.15,
                        letterSpacing: -0.2,
                      ),
                    ),
                  ),
                ),
                SizedBox(height: tight ? 4 : 6),
                Align(
                  alignment: Alignment.centerRight,
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      value,
                      textAlign: TextAlign.right,
                      style: TextStyle(
                        color: valueColor,
                        fontSize: tight ? 18 : 20,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.3,
                      ),
                    ),
                  ),
                ),
              ],
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Text(
                  'Ultimo Item',
                  style: TextStyle(
                    color: palette.textSecondary,
                    fontSize: tight
                        ? 10
                        : compact
                        ? 12
                        : 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(
                  height: tight
                      ? 2
                      : compact
                      ? 4
                      : 10,
                ),
                Row(
                  children: <Widget>[
                    Expanded(
                      flex: 5,
                      child: Text(
                        description,
                        maxLines: 1,
                        softWrap: false,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: descriptionColor,
                          fontSize: tight
                              ? 13
                              : compact
                              ? 14
                              : 18,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.2,
                        ),
                      ),
                    ),
                    SizedBox(
                      width: tight
                          ? 6
                          : compact
                          ? 8
                          : 16,
                    ),
                    Expanded(
                      flex: 3,
                      child: Align(
                        alignment: Alignment.centerRight,
                        child: FittedBox(
                          fit: BoxFit.scaleDown,
                          child: Text(
                            value,
                            textAlign: TextAlign.right,
                            style: TextStyle(
                              color: valueColor,
                              fontSize: tight
                                  ? 24
                                  : compact
                                  ? 26
                                  : 28,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -0.4,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
    );
  }

  Widget _buildSummaryCardsRow(bool compact, bool tight, double gap) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        Expanded(
          flex: 9,
          child: _buildTotalCard(compact, tight, condensed: true),
        ),
        SizedBox(width: gap),
        Expanded(
          flex: 11,
          child: _buildLastItemCard(compact, tight, condensed: true),
        ),
      ],
    );
  }

  Widget _buildEntryStrip(bool compact, bool tight) {
    final palette = context.appPalette;
    final valueText = _productController.text.isEmpty
        ? 'R\$ 0,00'
        : 'R\$ ${_productController.text}';
    final active = _activeAmountField == _AmountFieldTarget.product;
    final descriptionHintFontSize = tight
        ? 11.0
        : compact
        ? 12.0
        : 16.0;
    final descriptionFontSize = tight
        ? 12.0
        : compact
        ? 13.0
        : 17.0;
    final descriptionVerticalPadding = tight
        ? 3.0
        : compact
        ? 4.0
        : 6.0;

    return Row(
      children: <Widget>[
        Expanded(
          flex: 3,
          child: Container(
            height: double.infinity,
            decoration: _glowCardDecoration(compact: compact, tight: tight),
            padding: EdgeInsets.symmetric(
              horizontal: tight
                  ? 12
                  : compact
                  ? 14
                  : 18,
              vertical: descriptionVerticalPadding,
            ),
            alignment: Alignment.centerLeft,
            child: TextField(
              key: const ValueKey<String>('description-field'),
              controller: _descriptionController,
              focusNode: _descriptionFocusNode,
              maxLines: 1,
              textInputAction: TextInputAction.done,
              textAlignVertical: TextAlignVertical.center,
              strutStyle: StrutStyle(
                fontSize: descriptionFontSize,
                height: 1.2,
              ),
              decoration: InputDecoration(
                filled: false,
                isCollapsed: true,
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                disabledBorder: InputBorder.none,
                errorBorder: InputBorder.none,
                focusedErrorBorder: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(
                  vertical: descriptionVerticalPadding,
                ),
                hintText: 'Descricao do item (opcional)',
                hintStyle: TextStyle(
                  color: palette.textSecondary,
                  fontSize: descriptionHintFontSize,
                  height: 1.2,
                ),
              ),
              style: TextStyle(
                color: palette.textPrimary,
                fontSize: descriptionFontSize,
                fontWeight: FontWeight.w700,
                height: 1.2,
              ),
            ),
          ),
        ),
        SizedBox(
          width: tight
              ? 6
              : compact
              ? 8
              : 12,
        ),
        InkWell(
          borderRadius: BorderRadius.circular(
            tight
                ? 18
                : compact
                ? 20
                : 24,
          ),
          onTap: () {
            _selectAmountField(_AmountFieldTarget.product);
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            width: tight
                ? 120
                : compact
                ? 128
                : 148,
            height: double.infinity,
            padding: EdgeInsets.symmetric(
              horizontal: tight
                  ? 8
                  : compact
                  ? 9
                  : 12,
              vertical: tight ? 5 : 6,
            ),
            decoration: _glowCardDecoration(
              compact: compact,
              tight: tight,
              outlined: true,
              active: active,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                Text(
                  'Entrada',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: palette.textSecondary,
                    fontSize: tight
                        ? 8.5
                        : compact
                        ? 10
                        : 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(
                  height: tight
                      ? 1
                      : compact
                      ? 2
                      : 6,
                ),
                Expanded(
                  child: Center(
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        valueText,
                        style: TextStyle(
                          color: palette.accent,
                          fontSize: tight
                              ? 26
                              : compact
                              ? 28
                              : 32,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildKeypadArea(bool compact, bool tight) {
    final cartSize = tight
        ? 50.0
        : compact
        ? 56.0
        : 72.0;

    return Stack(
      children: <Widget>[
        Positioned.fill(
          child: Padding(
            padding: EdgeInsets.only(
              right: tight
                  ? 0
                  : compact
                  ? 2
                  : 10,
              bottom:
                  cartSize +
                  (tight
                      ? 6
                      : compact
                      ? 8
                      : 12),
            ),
            child: NumericKeypad(
              compact: compact,
              tight: tight,
              onDigitPressed: _appendDigit,
              onBackspacePressed: _backspaceValue,
              onClearPressed: _clearValue,
              onAddPressed: _handleAddItem,
              getCurrentValueDigits: () =>
                  _extractDigits(_activeAmountController.text),
              onSetValueDigits: _updateAmountValue,
            ),
          ),
        ),
        Positioned(
          right: tight
              ? 2
              : compact
              ? 4
              : 8,
          bottom: 0,
          child: _buildCartButton(compact, tight),
        ),
      ],
    );
  }

  Widget _buildCartButton(bool compact, bool tight) {
    final palette = context.appPalette;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return SizedBox(
          width: tight
              ? 50
              : compact
              ? 56
              : 72,
          height: tight
              ? 50
              : compact
              ? 56
              : 72,
          child: GestureDetector(
            onTap: _handleFloatingAction,
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: palette.accent,
                shape: BoxShape.circle,
                boxShadow: <BoxShadow>[
                  BoxShadow(
                    color: palette.accent.withValues(alpha: 0.42),
                    blurRadius: 16,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
              child: Stack(
                clipBehavior: Clip.none,
                alignment: Alignment.center,
                children: <Widget>[
                  Icon(
                    Icons.shopping_cart_rounded,
                    color: palette.accentForeground,
                    size: tight
                        ? 20
                        : compact
                        ? 24
                        : 28,
                  ),
                  if (_controller.itemCount > 0)
                    Positioned(
                      right: tight ? -4 : -6,
                      top: tight ? -2 : -4,
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: tight ? 5 : 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: palette.badge,
                          borderRadius: BorderRadius.circular(99),
                        ),
                        child: Text(
                          '${_controller.itemCount}',
                          style: TextStyle(
                            color: palette.surfaceSheet,
                            fontSize: tight ? 9 : 11,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _controller.removeListener(_handleBudgetAlertStateChanged);
    _budgetFocusNode.removeListener(_handleBudgetFocusChange);
    _descriptionFocusNode.removeListener(_handleDescriptionFocusChange);
    _budgetAlertPulseController.dispose();
    _controller.dispose();
    _budgetController.dispose();
    _descriptionController.dispose();
    _productController.dispose();
    _budgetFocusNode.dispose();
    _descriptionFocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.appPalette;
    final overlayStyle = Theme.of(context).brightness == Brightness.dark
        ? SystemUiOverlayStyle.light.copyWith(
            statusBarColor: Colors.transparent,
            systemNavigationBarColor: palette.backgroundBottom,
            systemNavigationBarIconBrightness: Brightness.light,
          )
        : SystemUiOverlayStyle.dark.copyWith(
            statusBarColor: Colors.transparent,
            systemNavigationBarColor: palette.backgroundBottom,
            systemNavigationBarIconBrightness: Brightness.dark,
          );

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: overlayStyle,
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        body: DecoratedBox(
          decoration: BoxDecoration(
            color: palette.backgroundBottom,
            gradient: RadialGradient(
              center: Alignment.topCenter,
              radius: 1.15,
              colors: <Color>[
                palette.backgroundTop,
                palette.backgroundMiddle,
                palette.backgroundBottom,
              ],
            ),
          ),
          child: SafeArea(
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, _) {
                if (_controller.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                return LayoutBuilder(
                  builder: (context, constraints) {
                    final keyboardInset = MediaQuery.of(
                      context,
                    ).viewInsets.bottom;
                    final keyboardVisible = keyboardInset > 0;
                    final compact =
                        constraints.maxHeight < 780 ||
                        constraints.maxWidth < 390;
                    final tight =
                        constraints.maxHeight < 700 ||
                        constraints.maxWidth < 360;
                    final horizontalPadding = tight
                        ? 12.0
                        : compact
                        ? 14.0
                        : 20.0;
                    final verticalPadding = tight
                        ? 6.0
                        : compact
                        ? 8.0
                        : 16.0;
                    final gap = tight
                        ? 6.0
                        : compact
                        ? 8.0
                        : 16.0;
                    final limitHeight = tight
                        ? 44.0
                        : compact
                        ? 50.0
                        : 64.0;
                    final entryHeight = tight
                        ? 62.0
                        : compact
                        ? 66.0
                        : 72.0;
                    final splitSummaryCards = compact;
                    final summaryCardsHeight = tight
                        ? 122.0
                        : compact
                        ? 136.0
                        : 0.0;
                    final totalFlex = tight
                        ? 13
                        : compact
                        ? 14
                        : 2;
                    final lastItemFlex = tight
                        ? 17
                        : compact
                        ? 18
                        : 2;
                    final keypadFlex = tight
                        ? 60
                        : compact
                        ? 57
                        : 6;
                    final maxWidth = constraints.maxWidth > 700
                        ? 520.0
                        : constraints.maxWidth;

                    return Center(
                      child: ConstrainedBox(
                        constraints: BoxConstraints(maxWidth: maxWidth),
                        child: SingleChildScrollView(
                          physics: keyboardVisible
                              ? const ClampingScrollPhysics()
                              : const NeverScrollableScrollPhysics(),
                          keyboardDismissBehavior:
                              ScrollViewKeyboardDismissBehavior.onDrag,
                          padding: EdgeInsets.only(
                            bottom: keyboardVisible ? keyboardInset + gap : 0,
                          ),
                          child: SizedBox(
                            height: constraints.maxHeight,
                            child: Padding(
                              padding: EdgeInsets.fromLTRB(
                                horizontalPadding,
                                verticalPadding,
                                horizontalPadding,
                                verticalPadding,
                              ),
                              child: Column(
                                children: <Widget>[
                                  _buildHeader(compact, tight),
                                  SizedBox(height: gap),
                                  // Limit card — small fixed height
                                  SizedBox(
                                    height: limitHeight,
                                    child: _buildLimitCard(compact, tight),
                                  ),
                                  SizedBox(height: gap),
                                  // Total card — flex 3
                                  if (splitSummaryCards)
                                    SizedBox(
                                      height: summaryCardsHeight,
                                      child: _buildSummaryCardsRow(
                                        compact,
                                        tight,
                                        gap,
                                      ),
                                    ),
                                  if (!splitSummaryCards)
                                    Expanded(
                                      flex: totalFlex,
                                      child: _buildTotalCard(compact, tight),
                                    ),
                                  if (!splitSummaryCards)
                                    SizedBox(height: gap),
                                  // Last item card — flex 2
                                  if (!splitSummaryCards)
                                    Expanded(
                                      flex: lastItemFlex,
                                      child: _buildLastItemCard(compact, tight),
                                    ),
                                  SizedBox(height: gap),
                                  // Entry strip — fixed height
                                  SizedBox(
                                    height: entryHeight,
                                    child: _buildEntryStrip(compact, tight),
                                  ),
                                  SizedBox(height: gap),
                                  // Keypad — flex 5 (biggest slice)
                                  Expanded(
                                    flex: keypadFlex,
                                    child: _buildKeypadArea(compact, tight),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}

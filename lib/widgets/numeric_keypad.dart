import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../core/theme/app_palette.dart';

class NumericKeypad extends StatefulWidget {
  const NumericKeypad({
    super.key,
    required this.onDigitPressed,
    required this.onBackspacePressed,
    required this.onClearPressed,
    required this.onAddPressed,
    required this.getCurrentValueDigits,
    required this.onSetValueDigits,
    this.compact = false,
    this.tight = false,
  });

  final ValueChanged<String> onDigitPressed;
  final VoidCallback onBackspacePressed;
  final VoidCallback onClearPressed;
  final VoidCallback onAddPressed;
  final String Function() getCurrentValueDigits;
  final ValueChanged<String> onSetValueDigits;
  final bool compact;
  final bool tight;

  @override
  State<NumericKeypad> createState() => _NumericKeypadState();
}

class _NumericKeypadState extends State<NumericKeypad> {
  String? _pendingValueDigits;
  String _qtyDigits = '';

  bool get _inMultiplyMode => _pendingValueDigits != null;

  void _handleDigit(String digit) {
    if (_inMultiplyMode) {
      setState(() => _qtyDigits += digit);
      return;
    }

    widget.onDigitPressed(digit);
  }

  void _handleBackspace() {
    if (_inMultiplyMode) {
      if (_qtyDigits.isNotEmpty) {
        setState(
          () => _qtyDigits = _qtyDigits.substring(0, _qtyDigits.length - 1),
        );
        return;
      }

      widget.onSetValueDigits(_pendingValueDigits!);
      setState(() {
        _pendingValueDigits = null;
        _qtyDigits = '';
      });
      return;
    }

    widget.onBackspacePressed();
  }

  void _handleMultiply() {
    if (_inMultiplyMode) {
      return;
    }

    final digits = widget.getCurrentValueDigits();
    if (digits.isEmpty) {
      return;
    }

    widget.onSetValueDigits('');
    setState(() {
      _pendingValueDigits = digits;
      _qtyDigits = '';
    });
  }

  void _handleAdd() {
    if (_inMultiplyMode) {
      final qty = int.tryParse(_qtyDigits) ?? 0;
      if (qty > 0) {
        final originalCents = int.parse(_pendingValueDigits!);
        final resultCents = originalCents * qty;
        widget.onSetValueDigits(resultCents.toString());
      } else {
        widget.onSetValueDigits(_pendingValueDigits!);
      }

      setState(() {
        _pendingValueDigits = null;
        _qtyDigits = '';
      });
    }

    widget.onAddPressed();
  }

  String get _multiplyHint {
    if (!_inMultiplyMode) {
      return '';
    }

    final qty = _qtyDigits.isEmpty ? '?' : _qtyDigits;
    return 'x $qty';
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final baseGap = widget.tight
            ? 6.0
            : widget.compact
            ? 8.0
            : 12.0;
        final availableHeight =
            constraints.maxHeight - (_inMultiplyMode ? 6.0 : 0.0);
        final maxButtonSize = widget.tight
            ? 60.0
            : widget.compact
            ? 66.0
            : 84.0;
        final buttonSize = math.max(
          0.0,
          math.min(
            maxButtonSize,
            math.min(
              (constraints.maxWidth - (baseGap * 3)) / 4,
              (availableHeight - (baseGap * 3)) / 4,
            ),
          ),
        );
        final extraHorizontalSpace = math.max(
          0.0,
          constraints.maxWidth - (buttonSize * 4) - (baseGap * 3),
        );
        final extraVerticalSpace = math.max(
          0.0,
          availableHeight - (buttonSize * 4) - (baseGap * 3),
        );
        final horizontalGap =
            baseGap +
            math.min(
              extraHorizontalSpace / 6,
              widget.compact ? 10.0 : 14.0,
            );
        final verticalGap =
            baseGap +
            math.min(
              extraVerticalSpace / 3,
              widget.compact ? 8.0 : 12.0,
            );

        final keypad = Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            _row(horizontalGap, <Widget>[
              _digitButton('7', buttonSize),
              _digitButton('8', buttonSize),
              _digitButton('9', buttonSize),
              _spacerCell(buttonSize),
            ]),
            SizedBox(height: verticalGap),
            _row(horizontalGap, <Widget>[
              _digitButton('4', buttonSize),
              _digitButton('5', buttonSize),
              _digitButton('6', buttonSize),
              _spacerCell(buttonSize),
            ]),
            SizedBox(height: verticalGap),
            _row(horizontalGap, <Widget>[
              _digitButton('1', buttonSize),
              _digitButton('2', buttonSize),
              _digitButton('3', buttonSize),
              _spacerCell(buttonSize),
            ]),
            SizedBox(height: verticalGap),
            _row(horizontalGap, <Widget>[
              _actionButton(
                id: 'multiply',
                label: 'x',
                buttonSize: buttonSize,
                onTap: _handleMultiply,
                accent: _inMultiplyMode,
              ),
              _digitButton('0', buttonSize),
              _actionButton(
                id: 'backspace',
                icon: Icons.backspace_outlined,
                buttonSize: buttonSize,
                onTap: _handleBackspace,
              ),
              _actionButton(
                id: 'add',
                icon: Icons.add_rounded,
                buttonSize: buttonSize,
                onTap: _handleAdd,
                primary: true,
              ),
            ]),
          ],
        );

        return Stack(
          clipBehavior: Clip.none,
          children: <Widget>[
            keypad,
            if (_inMultiplyMode)
              Positioned(
                top: widget.tight
                    ? -26
                    : widget.compact
                    ? -30
                    : -36,
                left: 0,
                right: 0,
                child: Center(
                  child: _MultiplyBanner(
                    hint: _multiplyHint,
                    compact: widget.compact,
                    tight: widget.tight,
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _row(double gap, List<Widget> children) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: _withSpacing(children, gap),
    );
  }

  Widget _spacerCell(double buttonSize) {
    return SizedBox(width: buttonSize, height: buttonSize);
  }

  List<Widget> _withSpacing(List<Widget> children, double gap) {
    final result = <Widget>[];
    for (var index = 0; index < children.length; index++) {
      if (index > 0) {
        result.add(SizedBox(width: gap));
      }
      result.add(children[index]);
    }
    return result;
  }

  Widget _digitButton(String digit, double buttonSize) {
    return _PulseCircleButton(
      key: ValueKey<String>('numpad-$digit'),
      size: buttonSize,
      label: digit,
      compact: widget.compact,
      tight: widget.tight,
      onTap: () => _handleDigit(digit),
    );
  }

  Widget _actionButton({
    required String id,
    required double buttonSize,
    required VoidCallback onTap,
    IconData? icon,
    String? label,
    bool primary = false,
    bool accent = false,
  }) {
    return _PulseCircleButton(
      key: ValueKey<String>('numpad-$id'),
      size: buttonSize,
      icon: icon,
      label: label,
      compact: widget.compact,
      tight: widget.tight,
      primary: primary,
      accent: accent,
      onTap: onTap,
    );
  }
}

class _MultiplyBanner extends StatelessWidget {
  const _MultiplyBanner({
    required this.hint,
    required this.compact,
    required this.tight,
  });

  final String hint;
  final bool compact;
  final bool tight;

  @override
  Widget build(BuildContext context) {
    final palette = context.appPalette;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: tight
            ? 12
            : compact
            ? 14
            : 20,
        vertical: tight
            ? 5
            : compact
            ? 6
            : 8,
      ),
      decoration: BoxDecoration(
        color: palette.accentSoft,
        borderRadius: BorderRadius.circular(99),
      ),
      child: Text(
        'Multiplicar $hint - pressione + para confirmar',
        style: TextStyle(
          color: palette.accent,
          fontSize: tight
              ? 10
              : compact
              ? 11
              : 13,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _PulseCircleButton extends StatefulWidget {
  const _PulseCircleButton({
    super.key,
    required this.size,
    required this.onTap,
    required this.compact,
    required this.tight,
    this.label,
    this.icon,
    this.primary = false,
    this.accent = false,
  });

  final double size;
  final VoidCallback onTap;
  final bool compact;
  final bool tight;
  final String? label;
  final IconData? icon;
  final bool primary;
  final bool accent;

  @override
  State<_PulseCircleButton> createState() => _PulseCircleButtonState();
}

class _PulseCircleButtonState extends State<_PulseCircleButton> {
  bool _pressed = false;

  void _flash() {
    setState(() => _pressed = true);
    Future<void>.delayed(const Duration(milliseconds: 120), () {
      if (mounted) {
        setState(() => _pressed = false);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.appPalette;
    final isPrimary = widget.primary;
    final isAccent = widget.accent;
    final Color bg;
    final Color fg;

    if (isPrimary) {
      bg = _pressed ? palette.accentStrong : palette.accent;
      fg = palette.accentForeground;
    } else if (isAccent) {
      bg = _pressed ? palette.keypadAccentPressed : palette.keypadAccent;
      fg = palette.accent;
    } else {
      bg = _pressed ? palette.keypadButtonPressed : palette.keypadButton;
      fg = palette.textPrimary;
    }

    return AnimatedScale(
      scale: _pressed ? 0.94 : 1,
      duration: const Duration(milliseconds: 120),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 120),
        width: widget.size,
        height: widget.size,
        decoration: BoxDecoration(
          color: bg,
          shape: BoxShape.circle,
          boxShadow: <BoxShadow>[
            BoxShadow(
              color: isPrimary
                  ? palette.accent.withValues(alpha: 0.32)
                  : palette.keypadShadow,
              blurRadius: _pressed ? 18 : 14,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: () {
              _flash();
              widget.onTap();
            },
            splashColor: palette.accent.withValues(alpha: 0.18),
            highlightColor: Colors.transparent,
            child: Center(
              child: widget.icon != null
                  ? Icon(
                      widget.icon,
                      size: widget.tight
                          ? 22
                          : widget.compact
                          ? 24
                          : 32,
                      color: fg,
                    )
                  : Text(
                      widget.label!,
                      style: TextStyle(
                        color: fg,
                        fontSize: widget.tight
                            ? 20
                            : widget.compact
                            ? 24
                            : 30,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

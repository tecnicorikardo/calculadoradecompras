import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class MoneyInputField extends StatelessWidget {
  const MoneyInputField({
    super.key,
    required this.controller,
    required this.focusNode,
    required this.labelText,
    required this.hintText,
    this.prefixText,
    this.errorText,
    this.autofocus = false,
    this.large = false,
    this.onChanged,
    this.onSubmitted,
    this.readOnly = false,
    this.showCursor = true,
    this.textAlign = TextAlign.start,
    this.onTap,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final String labelText;
  final String hintText;
  final String? prefixText;
  final String? errorText;
  final bool autofocus;
  final bool large;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final bool readOnly;
  final bool showCursor;
  final TextAlign textAlign;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return TextField(
      controller: controller,
      focusNode: focusNode,
      autofocus: autofocus,
      keyboardType: readOnly
          ? TextInputType.none
          : const TextInputType.numberWithOptions(decimal: true),
      textInputAction: TextInputAction.done,
      onChanged: onChanged,
      onSubmitted: onSubmitted,
      onTap: onTap,
      readOnly: readOnly,
      showCursor: showCursor,
      textAlign: textAlign,
      inputFormatters: <TextInputFormatter>[
        FilteringTextInputFormatter.allow(RegExp(r'[0-9,.\s]')),
      ],
      style: large
          ? theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w800,
              color: const Color(0xFF143D34),
            )
          : theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
            ),
      decoration: InputDecoration(
        labelText: labelText,
        hintText: hintText,
        prefixText: prefixText,
        errorText: errorText,
        prefixStyle: large
            ? theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: const Color(0xFF78908A),
              )
            : theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: const Color(0xFF78908A),
              ),
      ),
    );
  }
}

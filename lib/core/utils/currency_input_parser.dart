class CurrencyInputParser {
  CurrencyInputParser._();

  static final RegExp _digitsOnly = RegExp(r'^\d+$');
  static final RegExp _simpleDecimal = RegExp(r'^\d+([,.]\d{1,2})$');
  static final RegExp _ptBrThousands = RegExp(r'^\d{1,3}(\.\d{3})+(,\d{1,2})?$');
  static final RegExp _enUsThousands = RegExp(r'^\d{1,3}(,\d{3})+(\.\d{1,2})?$');

  static double? parse(String raw) {
    final sanitized = raw.trim().replaceAll(RegExp(r'[^0-9,.]'), '');
    if (sanitized.isEmpty) {
      return null;
    }

    if (_digitsOnly.hasMatch(sanitized)) {
      return double.tryParse(sanitized);
    }

    if (_simpleDecimal.hasMatch(sanitized)) {
      return double.tryParse(sanitized.replaceAll(',', '.'));
    }

    if (_ptBrThousands.hasMatch(sanitized)) {
      final normalized = sanitized.replaceAll('.', '').replaceAll(',', '.');
      return double.tryParse(normalized);
    }

    if (_enUsThousands.hasMatch(sanitized)) {
      final normalized = sanitized.replaceAll(',', '');
      return double.tryParse(normalized);
    }

    return null;
  }
}

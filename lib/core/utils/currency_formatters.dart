import 'package:intl/intl.dart';

class CurrencyFormatters {
  CurrencyFormatters._();

  static final NumberFormat brl = NumberFormat.currency(
    locale: 'pt_BR',
    symbol: 'R\$',
    decimalDigits: 2,
  );

  static final NumberFormat plain = NumberFormat.decimalPattern('pt_BR');
  static final NumberFormat amount = NumberFormat.currency(
    locale: 'pt_BR',
    symbol: '',
    decimalDigits: 2,
  );

  static String formatEditable(double value) {
    return plain.format(value);
  }

  static String formatAmount(double value) {
    return amount.format(value).trim();
  }
}

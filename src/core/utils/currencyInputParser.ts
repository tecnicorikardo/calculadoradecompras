export class CurrencyInputParser {
  private static digitsOnly = /^\d+$/;
  private static simpleDecimal = /^\d+([,.]\d{1,2})$/;
  private static ptBrThousands = /^\d{1,3}(\.\d{3})+(,\d{1,2})?$/;
  private static enUsThousands = /^\d{1,3}(,\d{3})+(\.\d{1,2})?$/;

  static parse(raw: string): number | null {
    const sanitized = raw.trim().replace(/[^0-9,.]/g, '');
    if (!sanitized) {
      return null;
    }

    if (this.digitsOnly.test(sanitized)) {
      const val = parseFloat(sanitized);
      return isNaN(val) ? null : val;
    }

    if (this.simpleDecimal.test(sanitized)) {
      const val = parseFloat(sanitized.replace(',', '.'));
      return isNaN(val) ? null : val;
    }

    if (this.ptBrThousands.test(sanitized)) {
      const normalized = sanitized.replace(/\./g, '').replace(',', '.');
      const val = parseFloat(normalized);
      return isNaN(val) ? null : val;
    }

    if (this.enUsThousands.test(sanitized)) {
      const normalized = sanitized.replace(/,/g, '');
      const val = parseFloat(normalized);
      return isNaN(val) ? null : val;
    }

    // Fallback: simple numeric extraction
    const fallbackNormalized = sanitized.replace(/\./g, '').replace(',', '.');
    const fallbackVal = parseFloat(fallbackNormalized);
    return isNaN(fallbackVal) ? null : fallbackVal;
  }
}

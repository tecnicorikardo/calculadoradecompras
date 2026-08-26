export class CurrencyFormatters {
  private static brlFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  private static decimalFormatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  private static plainDecimalFormatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  /**
   * Format value with R$ currency symbol (e.g., "R$ 25,50")
   */
  static formatBRL(value: number): string {
    return this.brlFormatter.format(value);
  }

  /**
   * Format value as decimal without currency symbol (e.g., "25,50")
   */
  static formatAmount(value: number): string {
    return this.decimalFormatter.format(value).trim();
  }

  /**
   * Format for editable inputs (e.g. "25,50")
   */
  static formatEditable(value: number): string {
    return this.plainDecimalFormatter.format(value);
  }
}

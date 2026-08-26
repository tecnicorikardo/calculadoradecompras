import React, { useEffect, useCallback } from 'react';
import { Delete, Plus, ShoppingCart } from 'lucide-react';

interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onAdd: () => void;
  onOpenCart: () => void;
  itemCount: number;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onDigit,
  onBackspace,
  onClear,
  onAdd,
  onOpenCart,
  itemCount,
}) => {
  // Physical keyboard listeners
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture if focused on an input element
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA')
      ) {
        if (e.key === 'Enter') {
          e.preventDefault();
          onAdd();
        }
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        onDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
      } else if (e.key === 'Delete' || e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        onClear();
      } else if (e.key === 'Enter' || e.key === '+') {
        e.preventDefault();
        onAdd();
      }
    },
    [onDigit, onBackspace, onClear, onAdd]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const buttonBase =
    'h-12 sm:h-14 md:h-16 rounded-2xl font-black text-xl sm:text-2xl transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer select-none';

  const numButtonClass = `${buttonBase} bg-white dark:bg-[#252D3B] text-[#243041] dark:text-[#F3F6FC] border border-[#E9DADF] dark:border-[#2B3547] shadow-[0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-none hover:bg-[#FFE6E8]/40 dark:hover:bg-[#30394A] active:bg-[#FFE6E8] dark:active:bg-[#384357]`;

  const actionButtonClass = `${buttonBase} bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A] border border-[#FF4D57]/20 dark:border-[#FF5C64]/20 hover:bg-[#FFD5D9] dark:hover:bg-[#433039] active:bg-[#FFC0C6]`;

  return (
    <div className="relative w-full">
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5 w-full">
        {/* Row 1 */}
        <button type="button" onClick={() => onDigit('1')} className={numButtonClass}>
          1
        </button>
        <button type="button" onClick={() => onDigit('2')} className={numButtonClass}>
          2
        </button>
        <button type="button" onClick={() => onDigit('3')} className={numButtonClass}>
          3
        </button>
        <button
          type="button"
          onClick={onClear}
          className={`${actionButtonClass} font-bold text-lg`}
          title="Limpar valor"
        >
          C
        </button>

        {/* Row 2 */}
        <button type="button" onClick={() => onDigit('4')} className={numButtonClass}>
          4
        </button>
        <button type="button" onClick={() => onDigit('5')} className={numButtonClass}>
          5
        </button>
        <button type="button" onClick={() => onDigit('6')} className={numButtonClass}>
          6
        </button>
        <button
          type="button"
          onClick={onBackspace}
          className={actionButtonClass}
          title="Apagar dígito"
        >
          <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Row 3 & 4 with tall Add button */}
        <button type="button" onClick={() => onDigit('7')} className={numButtonClass}>
          7
        </button>
        <button type="button" onClick={() => onDigit('8')} className={numButtonClass}>
          8
        </button>
        <button type="button" onClick={() => onDigit('9')} className={numButtonClass}>
          9
        </button>

        {/* Add button spanning row 3 & 4 */}
        <button
          type="button"
          onClick={onAdd}
          className="row-span-2 rounded-2xl bg-[#FF4D57] hover:bg-[#FF2F38] text-white font-black text-2xl sm:text-3xl shadow-[0_6px_20px_rgba(255,77,87,0.38)] active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          title="Adicionar à lista (+)"
        >
          <Plus className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
        </button>

        {/* Row 4 */}
        <button type="button" onClick={() => onDigit('00')} className={numButtonClass}>
          00
        </button>
        <button type="button" onClick={() => onDigit('0')} className={numButtonClass}>
          0
        </button>
        <button
          type="button"
          onClick={() => onDigit('0')}
          className={`${numButtonClass} text-base sm:text-lg`}
          title="Vírgula"
        >
          ,00
        </button>
      </div>

      {/* Floating Cart Button */}
      <div className="flex justify-end pt-3 sm:pt-4">
        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FF4D57] hover:bg-[#FF2F38] text-white shadow-[0_8px_24px_rgba(255,77,87,0.45)] transition-all active:scale-90 cursor-pointer"
          title="Ver lista de compras"
        >
          <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#243041] dark:bg-white text-white dark:text-[#243041] text-xs font-black flex items-center justify-center shadow-md animate-scale">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

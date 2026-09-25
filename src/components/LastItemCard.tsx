import React from 'react';
import { Tag } from 'lucide-react';
import { ShoppingItem, GroupedItem } from '../types';
import { CurrencyFormatters } from '../core/utils/currencyFormatters';

interface LastItemCardProps {
  lastItem: ShoppingItem | null;
  groupedItems: GroupedItem[];
  condensed?: boolean;
}

export const LastItemCard: React.FC<LastItemCardProps> = ({
  lastItem,
  groupedItems,
  condensed = false,
}) => {
  // Find group for this last item to show multiplier
  let lastGroup: GroupedItem | undefined;
  if (lastItem) {
    const descKey = (lastItem.description || '').trim().toLowerCase();
    lastGroup = groupedItems.find(
      (g) => (g.description || '').trim().toLowerCase() === descKey && Math.abs(g.unitValue - lastItem.value) < 0.001
    );
  }

  const quantity = lastGroup?.quantity ?? 1;
  const rawDescription = lastItem
    ? lastItem.description?.trim() || 'Item sem descrição'
    : null;

  const description = lastItem && quantity > 1
    ? `${quantity}× ${rawDescription}`
    : rawDescription;

  const unitFormatted = lastItem ? CurrencyFormatters.formatBRL(lastItem.value) : '';
  const totalFormatted = lastItem
    ? CurrencyFormatters.formatBRL(lastItem.value * quantity)
    : '';

  return (
    <div
      className={`w-full rounded-2xl bg-[#FFFEFD] dark:bg-[#1B2230] border border-[#E9DADF] dark:border-[#2B3547] shadow-sm transition-all duration-200 ${
        condensed ? 'p-2.5 sm:p-3' : 'p-3.5 sm:p-4'
      }`}
    >
      {/* Header label */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#A6B0C1] dark:text-[#737B88]" />
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#737B88] dark:text-[#A6B0C1]">
            Último item
          </span>
        </div>
        {lastItem && quantity > 1 && (
          <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A]">
            {quantity} un.
          </span>
        )}
      </div>

      {/* Content */}
      {!lastItem ? (
        /* Empty state */
        <p className="text-sm text-[#A6B0C1] dark:text-[#737B88] italic">
          Nenhum item adicionado ainda
        </p>
      ) : (
        <div className="flex items-center justify-between gap-2">
          {/* Description — wraps in 2 lines máx */}
          <span
            className={`font-semibold text-[#243041] dark:text-[#F3F6FC] leading-tight line-clamp-2 flex-1 ${
              condensed ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
            }`}
          >
            {description}
          </span>

          {/* Value */}
          <div className="flex flex-col items-end shrink-0">
            <span
              className={`font-black text-[#FF2F38] dark:text-[#FF737A] ${
                condensed ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
              }`}
            >
              {quantity > 1 ? totalFormatted : unitFormatted}
            </span>
            {quantity > 1 && (
              <span className="text-[10px] text-[#A6B0C1] dark:text-[#737B88] font-medium">
                {unitFormatted} cada
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

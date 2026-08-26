import React from 'react';
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
    ? lastItem.description?.trim() || 'Item'
    : 'Nenhum item adicionado';

  const description = lastItem && quantity > 1
    ? `${quantity}x ${rawDescription}`
    : rawDescription;

  const unitFormatted = lastItem ? CurrencyFormatters.formatBRL(lastItem.value) : 'R$ 0,00';
  const totalFormatted = lastItem
    ? CurrencyFormatters.formatBRL(lastItem.value * quantity)
    : 'R$ 0,00';

  const valueDisplay = !lastItem
    ? 'R$ 0,00'
    : quantity > 1
    ? `${quantity} x ${unitFormatted} = ${totalFormatted}`
    : unitFormatted;

  return (
    <div
      className={`w-full rounded-2xl bg-[#FFFEFD] dark:bg-[#1B2230] border border-[#E9DADF] dark:border-[#2B3547] shadow-sm transition-all duration-200 flex flex-col justify-between ${
        condensed ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-[11px] sm:text-xs font-semibold text-[#737B88] dark:text-[#A6B0C1]">
          Último Item
        </span>
        {lastItem && quantity > 1 && (
          <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A]">
            {quantity} un.
          </span>
        )}
      </div>

      <div className="my-0.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 overflow-hidden">
        <span
          className={`font-bold truncate text-[#243041] dark:text-[#F3F6FC] ${
            !lastItem ? 'text-[#737B88] dark:text-[#A6B0C1] font-normal italic' : ''
          } ${condensed ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}
        >
          {description}
        </span>

        <span
          className={`font-black text-right shrink-0 text-[#FF2F38] dark:text-[#FF737A] ${
            !lastItem ? 'text-[#737B88] dark:text-[#A6B0C1]' : ''
          } ${condensed ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}`}
        >
          {valueDisplay}
        </span>
      </div>
    </div>
  );
};

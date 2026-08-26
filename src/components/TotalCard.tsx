import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { CurrencyFormatters } from '../core/utils/currencyFormatters';
import { BudgetStatus } from '../types';

interface TotalCardProps {
  total: number;
  budgetStatus: BudgetStatus;
  budgetLimit: number | null;
  condensed?: boolean;
}

export const TotalCard: React.FC<TotalCardProps> = ({
  total,
  budgetStatus,
  budgetLimit,
  condensed = false,
}) => {
  const isAlert = budgetStatus !== 'normal' && budgetLimit !== null;
  const isLimitReached = budgetLimit !== null && total >= budgetLimit;

  let badgeLabel = '';
  if (isLimitReached) {
    badgeLabel = total > budgetLimit ? 'Acima do limite' : 'Limite atingido';
  } else if (budgetStatus === 'attention') {
    badgeLabel = 'Quase no limite';
  }

  const alertColor = isLimitReached || budgetStatus === 'exceeded'
    ? 'text-[#FF2F38] dark:text-[#FF737A]'
    : 'text-[#E59800] dark:text-[#FFC95E]';

  const alertBadgeBg = isLimitReached || budgetStatus === 'exceeded'
    ? 'bg-[#FF2F38]/10 border-[#FF2F38]/30 text-[#FF2F38] dark:text-[#FF737A]'
    : 'bg-[#FFC857]/15 border-[#FFC857]/40 text-[#C27803] dark:text-[#FFC95E]';

  const cardBorderClass = isAlert
    ? isLimitReached
      ? 'border-[#FF2F38] dark:border-[#FF737A] shadow-[0_0_20px_rgba(255,47,56,0.22)]'
      : 'border-[#FFC857] dark:border-[#FFC95E] shadow-[0_0_16px_rgba(255,200,87,0.2)]'
    : 'border-[#E9DADF] dark:border-[#2B3547] shadow-sm';

  return (
    <div
      className={`w-full rounded-2xl bg-[#FFFEFD] dark:bg-[#1B2230] border transition-all duration-300 flex flex-col items-center justify-center ${cardBorderClass} ${
        condensed ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#737B88] dark:text-[#A6B0C1]">
          Total
        </span>

        {isAlert && (
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] sm:text-xs font-bold animate-alert-pulse ${alertBadgeBg}`}
          >
            {isLimitReached ? (
              <AlertCircle className="w-3 h-3 shrink-0" />
            ) : (
              <AlertTriangle className="w-3 h-3 shrink-0" />
            )}
            <span>{badgeLabel}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 my-1 overflow-hidden max-w-full">
        {isAlert && !condensed && (
          <AlertTriangle className={`w-6 h-6 sm:w-8 sm:h-8 shrink-0 ${alertColor} animate-pulse`} />
        )}
        <span
          className={`font-black tracking-tight truncate text-[#FF2F38] dark:text-[#FF737A] transition-colors ${
            condensed
              ? 'text-2xl sm:text-3xl'
              : 'text-3xl sm:text-5xl md:text-6xl'
          }`}
          style={{
            textShadow: isLimitReached
              ? '0 0 24px rgba(255, 47, 56, 0.35)'
              : '0 0 16px rgba(255, 77, 87, 0.2)',
          }}
        >
          {CurrencyFormatters.formatBRL(total)}
        </span>
      </div>

      {budgetLimit !== null && (
        <div className="text-[11px] sm:text-xs font-semibold text-[#737B88] dark:text-[#A6B0C1]">
          Limite: <span className="font-bold">{CurrencyFormatters.formatBRL(budgetLimit)}</span>
          {total < budgetLimit && (
            <span className="ml-1 text-emerald-600 dark:text-emerald-400">
              (Resta {CurrencyFormatters.formatBRL(budgetLimit - total)})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

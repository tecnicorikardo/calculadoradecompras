import React from 'react';
import { AlertCircle, AlertTriangle, TrendingUp } from 'lucide-react';
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
      ? 'border-[#FF2F38] dark:border-[#FF737A] shadow-[0_0_24px_rgba(255,47,56,0.25)]'
      : 'border-[#FFC857] dark:border-[#FFC95E] shadow-[0_0_20px_rgba(255,200,87,0.22)]'
    : 'border-[#E9DADF] dark:border-[#2B3547] shadow-sm';

  return (
    <div
      className={`w-full rounded-2xl bg-[#FFFEFD] dark:bg-[#1B2230] border transition-all duration-300 flex flex-col items-center justify-center ${cardBorderClass} ${
        condensed ? 'py-2.5 px-3' : 'py-4 px-4 sm:py-5'
      }`}
    >
      {/* Label row */}
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-3.5 h-3.5 text-[#A6B0C1] dark:text-[#737B88]" />
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#737B88] dark:text-[#A6B0C1]">
          Total da compra
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

      {/* Value */}
      <div className="flex items-center justify-center gap-2 overflow-hidden max-w-full">
        {isAlert && !condensed && (
          <AlertTriangle className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 ${alertColor} animate-pulse`} />
        )}
        <span
          className={`font-black tracking-tight truncate text-[#FF2F38] dark:text-[#FF737A] transition-colors ${
            condensed
              ? 'text-2xl sm:text-3xl'
              : 'text-4xl sm:text-5xl md:text-6xl'
          }`}
          style={{
            textShadow: isLimitReached
              ? '0 0 28px rgba(255, 47, 56, 0.4)'
              : '0 0 20px rgba(255, 77, 87, 0.25)',
          }}
        >
          {CurrencyFormatters.formatBRL(total)}
        </span>
      </div>

      {/* Budget info */}
      {budgetLimit !== null && !condensed && (
        <div className="mt-1.5 text-[11px] sm:text-xs font-semibold text-[#737B88] dark:text-[#A6B0C1]">
          Limite: <span className="font-bold">{CurrencyFormatters.formatBRL(budgetLimit)}</span>
          {total < budgetLimit && (
            <span className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              · Resta {CurrencyFormatters.formatBRL(budgetLimit - total)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

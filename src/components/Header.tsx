import React from 'react';
import { SlidersHorizontal, Sparkles, AlertTriangle } from 'lucide-react';
import { AppInfo } from '../core/config/appInfo';
import { BudgetStatus } from '../types';

interface HeaderProps {
  budgetStatus: BudgetStatus;
  budgetLimit: number | null;
  total: number;
  isPro: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  onOpenSettings: () => void;
  onOpenUpgrade: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  budgetStatus,
  budgetLimit,
  total,
  isPro,
  isTrialActive,
  trialDaysRemaining,
  onOpenSettings,
  onOpenUpgrade,
}) => {
  const showAlertTitle = budgetStatus !== 'normal' && budgetLimit !== null;
  const isLimitReached = budgetLimit !== null && total >= budgetLimit;

  let alertHeadline = '';
  if (showAlertTitle) {
    if (isLimitReached) {
      alertHeadline = total > budgetLimit ? 'Limite excedido' : 'Limite atingido';
    } else {
      alertHeadline = 'Atenção ao limite';
    }
  }

  const alertColorClass = isLimitReached || budgetStatus === 'exceeded'
    ? 'text-[#FF2F38] dark:text-[#FF737A]'
    : 'text-[#E59800] dark:text-[#FFC95E]';

  return (
    <header className="flex items-center justify-between gap-3 w-full py-1">
      <div className="flex items-baseline gap-2 min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#FF2F38] dark:text-[#FF737A] shrink-0">
          {AppInfo.appName}
        </h1>

        {showAlertTitle && (
          <div className="flex items-center gap-1.5 min-w-0 animate-pulse">
            <AlertTriangle className={`w-4 h-4 shrink-0 ${alertColorClass}`} />
            <span className={`text-sm sm:text-base font-bold truncate ${alertColorClass}`}>
              {alertHeadline}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isPro && isTrialActive && (
          <button
            onClick={onOpenUpgrade}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFECEE] dark:bg-[#342129] border border-[#FF4D57]/30 text-[#FF4D57] dark:text-[#FF737A] hover:bg-[#FFD5D9] dark:hover:bg-[#433039] transition-colors text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
            title="Ver planos PRO"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{trialDaysRemaining}d grátis</span>
          </button>
        )}

        {isPro && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-wide">
            <Sparkles className="w-3 h-3" />
            PRO
          </span>
        )}

        <button
          onClick={onOpenSettings}
          className="p-2 sm:p-2.5 rounded-full bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A] hover:bg-[#FFD5D9] dark:hover:bg-[#433039] transition-all active:scale-90 shadow-xs cursor-pointer"
          aria-label="Configurações"
          title="Configurações"
        >
          <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </header>
  );
};

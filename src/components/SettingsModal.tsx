import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Sun,
  Moon,
  Mail,
  Phone,
  Copy,
  Info,
  DollarSign,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { AppInfo } from '../core/config/appInfo';
import { ThemeMode } from '../types';
import { CurrencyFormatters } from '../core/utils/currencyFormatters';
import { CurrencyInputParser } from '../core/utils/currencyInputParser';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetLimit: number | null;
  onUpdateBudgetLimit: (limit: number | null) => void;
  themeMode: ThemeMode;
  onThemeModeChanged: (mode: ThemeMode) => void;
  isPro: boolean;
  onOpenUpgrade: () => void;
  onResetTrial: () => void;
  onExpireTrial: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  budgetLimit,
  onUpdateBudgetLimit,
  themeMode,
  onThemeModeChanged,
  isPro,
  onOpenUpgrade,
  onResetTrial,
  onExpireTrial,
}) => {
  const [budgetInput, setBudgetInput] = useState(() =>
    budgetLimit !== null ? CurrencyFormatters.formatEditable(budgetLimit) : ''
  );
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveBudget = () => {
    if (!budgetInput.trim()) {
      onUpdateBudgetLimit(null);
      return;
    }
    const val = CurrencyInputParser.parse(budgetInput);
    if (val !== null && val >= 0) {
      onUpdateBudgetLimit(val === 0 ? null : val);
    }
  };

  const handleCopy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch {
      // Ignored
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg max-h-[88vh] flex flex-col bg-[#FFFBFC] dark:bg-[#161C28] rounded-t-3xl sm:rounded-3xl border border-[#E9DADF] dark:border-[#2B3547] shadow-2xl overflow-hidden"
        >
          {/* Header handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-[#FFCFD5] dark:bg-white/20" />
          </div>

          <div className="px-5 py-3 flex items-center justify-between border-b border-[#E9DADF]/60 dark:border-[#2B3547]/60">
            <div>
              <h2 className="text-lg font-black text-[#243041] dark:text-[#F3F6FC]">
                Configurações
              </h2>
              <p className="text-xs text-[#737B88] dark:text-[#A6B0C1]">
                Personalize a sua experiência e limite de compras.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A] hover:bg-[#FFD5D9] dark:hover:bg-[#433039] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Section 1: Budget Limit */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#737B88] dark:text-[#A6B0C1] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#FF4D57]" />
                Limite de Gastos
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-[#737B88] dark:text-[#A6B0C1]">
                    R$
                  </span>
                  <input
                    type="text"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    onBlur={handleSaveBudget}
                    placeholder="0,00 (sem limite)"
                    className="w-full bg-white dark:bg-[#1B2230] border border-[#E9DADF] dark:border-[#2B3547] rounded-xl pl-10 pr-4 py-2.5 text-base font-bold text-[#243041] dark:text-[#F3F6FC] focus:border-[#FF4D57] outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveBudget}
                  className="px-4 py-2.5 rounded-xl bg-[#FF4D57] hover:bg-[#FF2F38] text-white font-bold text-sm shadow-xs transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-[#737B88] dark:text-[#A6B0C1]">
                Deixe em branco ou zero para desativar o alerta de teto orçamentário.
              </p>
            </div>

            {/* Section 2: Theme */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#737B88] dark:text-[#A6B0C1] flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-[#FF4D57]" />
                Tema Visual
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#F8F0F2] dark:bg-[#141A25] p-1 rounded-2xl border border-[#E9DADF] dark:border-[#2B3547]">
                <button
                  type="button"
                  onClick={() => onThemeModeChanged('light')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    themeMode === 'light'
                      ? 'bg-white dark:bg-[#1B2230] text-[#FF4D57] shadow-sm'
                      : 'text-[#737B88] dark:text-[#A6B0C1]'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Claro</span>
                </button>
                <button
                  type="button"
                  onClick={() => onThemeModeChanged('dark')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    themeMode === 'dark'
                      ? 'bg-[#1B2230] text-[#FF737A] shadow-sm'
                      : 'text-[#737B88] dark:text-[#A6B0C1]'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Escuro</span>
                </button>
              </div>
            </div>

            {/* Section 3: PRO status */}
            <div className="p-4 rounded-2xl bg-[#FFECEE]/50 dark:bg-[#342129]/50 border border-[#FF4D57]/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF4D57]" />
                  <span className="font-bold text-sm text-[#243041] dark:text-[#F3F6FC]">
                    Plano Atual
                  </span>
                </div>
                {isPro ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-xs">
                    PRO Vitalício Ativo
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenUpgrade();
                    }}
                    className="px-3 py-1 rounded-xl bg-[#FF4D57] hover:bg-[#FF2F38] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Obter PRO ({AppInfo.proPriceFormatted})
                  </button>
                )}
              </div>
            </div>

            {/* Section 4: Contact */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#737B88] dark:text-[#A6B0C1] flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#FF4D57]" />
                Contato & Suporte
              </label>
              <div className="space-y-2">
                {/* Email tile */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1B2230] border border-[#E9DADF] dark:border-[#2B3547]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-[#737B88]" />
                    <div className="truncate">
                      <p className="text-[10px] text-[#737B88] font-bold">Email de suporte</p>
                      <p className="text-xs font-bold text-[#243041] dark:text-[#F3F6FC] truncate">
                        {AppInfo.supportEmail}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('Email', AppInfo.supportEmail)}
                    className="px-2.5 py-1 rounded-lg bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A] text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedItem === 'Email' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedItem === 'Email' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                {/* Phone tile */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1B2230] border border-[#E9DADF] dark:border-[#2B3547]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="w-4 h-4 text-[#737B88]" />
                    <div className="truncate">
                      <p className="text-[10px] text-[#737B88] font-bold">WhatsApp / Telefone</p>
                      <p className="text-xs font-bold text-[#243041] dark:text-[#F3F6FC] truncate">
                        {AppInfo.supportPhone}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('Telefone', AppInfo.supportPhone)}
                    className="px-2.5 py-1 rounded-lg bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A] text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedItem === 'Telefone' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedItem === 'Telefone' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 5: App info & testing tools */}
            <div className="pt-2 border-t border-[#E9DADF]/60 dark:border-[#2B3547]/60 flex items-center justify-between text-xs text-[#737B88] dark:text-[#A6B0C1]">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>
                  {AppInfo.appName} v{AppInfo.appVersion}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onResetTrial}
                  title="Reiniciar período de teste"
                  className="text-[10px] underline hover:text-[#FF4D57] flex items-center gap-0.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reiniciar teste
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={onExpireTrial}
                  title="Simular período encerrado"
                  className="text-[10px] underline hover:text-[#FF4D57]"
                >
                  Expirar teste
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

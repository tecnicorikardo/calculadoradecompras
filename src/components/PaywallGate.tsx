import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { AppInfo } from '../core/config/appInfo';

interface PaywallGateProps {
  onOpenUpgrade: () => void;
}

export const PaywallGate: React.FC<PaywallGateProps> = ({ onOpenUpgrade }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-[#FFECEE] dark:bg-[#342129] flex items-center justify-center text-[#FF4D57] dark:text-[#FF737A] mb-6 shadow-md animate-bounce">
        <Lock className="w-10 h-10 stroke-[2.5]" />
      </div>

      <h2 className="text-2xl font-black text-[#243041] dark:text-[#F3F6FC] tracking-tight mb-3">
        Período gratuito encerrado
      </h2>

      <p className="text-sm text-[#737B88] dark:text-[#A6B0C1] leading-relaxed mb-8">
        Adquira o acesso vitalício por apenas{' '}
        <span className="font-black text-[#FF4D57] dark:text-[#FF737A]">
          {AppInfo.proPriceFormatted}
        </span>{' '}
        e continue calculando suas compras para sempre com controle total de orçamento.
      </p>

      <button
        type="button"
        onClick={onOpenUpgrade}
        className="w-full py-4 px-6 rounded-2xl bg-[#FF4D57] hover:bg-[#FF2F38] text-white font-black text-base flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,77,87,0.4)] active:scale-98 transition-all cursor-pointer"
      >
        <Sparkles className="w-5 h-5" />
        <span>Ver planos — {AppInfo.proPriceFormatted}</span>
      </button>
    </div>
  );
};

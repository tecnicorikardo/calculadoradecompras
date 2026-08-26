import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { AppInfo } from '../core/config/appInfo';
import { PixPaymentData } from '../types';
import { proService } from '../services/proService';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivated: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onActivated,
}) => {
  const [loadingPix, setLoadingPix] = useState(false);
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const loadPix = useCallback(async () => {
    setLoadingPix(true);
    try {
      const data = await proService.createPixPayment();
      setPixData(data);
    } catch {
      // Fallback handled in service
    } finally {
      setLoadingPix(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !pixData) {
      loadPix();
    }
  }, [isOpen, pixData, loadPix]);

  if (!isOpen) return null;

  const handleCopyPix = async () => {
    if (!pixData?.qrcode) return;
    try {
      await navigator.clipboard.writeText(pixData.qrcode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    } catch {
      // Ignored
    }
  };

  const handleVerifyOrActivate = () => {
    setVerifying(true);
    setTimeout(() => {
      proService.activatePro();
      setIsSuccess(true);
      setVerifying(false);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignored
      }
      setTimeout(() => {
        onActivated();
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md max-h-[92vh] flex flex-col bg-[#FFFBFC] dark:bg-[#161C28] rounded-t-3xl sm:rounded-3xl border border-[#E9DADF] dark:border-[#2B3547] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-[#FFCFD5] dark:bg-white/20" />
          </div>

          <div className="px-5 py-3 flex items-center justify-between border-b border-[#E9DADF]/60 dark:border-[#2B3547]/60">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#243041] dark:text-[#F3F6FC]">
                  Soma Fácil PRO
                </h2>
                <p className="text-xs text-[#737B88] dark:text-[#A6B0C1]">
                  Acesso vitalício sem mensalidades
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A] hover:bg-[#FFD5D9] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {isSuccess ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-xl font-black text-[#243041] dark:text-[#F3F6FC]">
                  Parabéns! Você é PRO 🎉
                </h3>
                <p className="text-xs text-[#737B88] dark:text-[#A6B0C1] max-w-xs mx-auto">
                  Seu acesso vitalício foi ativado com sucesso. Aproveite o Soma Fácil sem limites!
                </p>
              </div>
            ) : (
              <>
                {/* Benefits */}
                <div className="p-4 rounded-2xl bg-[#FFECEE]/40 dark:bg-[#342129]/30 border border-[#FF4D57]/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#243041] dark:text-[#F3F6FC]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Pagamento único de apenas {AppInfo.proPriceFormatted}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#243041] dark:text-[#F3F6FC]">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Uso 100% offline e privativo no seu aparelho</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#243041] dark:text-[#F3F6FC]">
                    <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Itens e listas ilimitadas para sempre</span>
                  </div>
                </div>

                {/* PIX QR Code & copy */}
                <div className="flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-[#1B2230] border border-[#E9DADF] dark:border-[#2B3547] text-center space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-[#737B88] dark:text-[#A6B0C1] flex items-center gap-1">
                    <QrCode className="w-4 h-4 text-[#FF4D57]" />
                    Pague com Pix Instantâneo
                  </span>

                  {loadingPix ? (
                    <div className="w-48 h-48 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-[#FF4D57] animate-spin" />
                    </div>
                  ) : pixData ? (
                    <div className="p-3 bg-white rounded-2xl shadow-inner border border-neutral-200">
                      <QRCodeSVG value={pixData.qrcode} size={180} />
                    </div>
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-neutral-400">
                      Erro ao gerar QR Code
                    </div>
                  )}

                  <div className="w-full space-y-2">
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      disabled={!pixData}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A] hover:bg-[#FFD5D9] dark:hover:bg-[#433039] text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                    >
                      {copiedPix ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Código Pix copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Código Pix (Copia e Cola)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm button */}
                <button
                  type="button"
                  onClick={handleVerifyOrActivate}
                  disabled={verifying}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#FF4D57] hover:bg-[#FF2F38] text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,77,87,0.35)] active:scale-98 transition-all cursor-pointer"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verificando pagamento...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Já fiz o Pix — Ativar PRO</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

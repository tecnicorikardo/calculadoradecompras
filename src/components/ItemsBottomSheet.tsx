import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Trash2,
  Share2,
  Plus,
  Minus,
  ShoppingBag,
  AlertCircle,
  Check,
} from 'lucide-react';
import { GroupedItem, ShoppingItem, BudgetStatus } from '../types';
import { CurrencyFormatters } from '../core/utils/currencyFormatters';

interface ItemsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingItem[];
  groupedItems: GroupedItem[];
  total: number;
  budgetLimit: number | null;
  budgetStatus: BudgetStatus;
  onIncrement: (group: GroupedItem) => void;
  onDecrement: (group: GroupedItem) => void;
  onRemoveGroup: (group: GroupedItem) => void;
  onClearAll: () => void;
}

export const ItemsBottomSheet: React.FC<ItemsBottomSheetProps> = ({
  isOpen,
  onClose,
  items,
  groupedItems,
  total,
  budgetLimit,
  budgetStatus,
  onIncrement,
  onDecrement,
  onRemoveGroup,
  onClearAll,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen) return null;

  const buildShareText = () => {
    const lines: string[] = ['🛒 *Lista de Compras - Soma Fácil*\n'];

    groupedItems.forEach((group, index) => {
      const desc = group.description || 'Item';
      const unit = CurrencyFormatters.formatBRL(group.unitValue);
      const subtotal = CurrencyFormatters.formatBRL(group.totalValue);

      if (group.quantity > 1) {
        lines.push(`${index + 1}. ${group.quantity}x ${desc} (${unit} un.) = ${subtotal}`);
      } else {
        lines.push(`${index + 1}. ${desc} - ${unit}`);
      }
    });

    lines.push('\n---------------------------');
    lines.push(`💰 *Total: ${CurrencyFormatters.formatBRL(total)}* (${items.length} itens)`);

    if (budgetLimit !== null) {
      lines.push(`🎯 Limite de gasto: ${CurrencyFormatters.formatBRL(budgetLimit)}`);
      if (total > budgetLimit) {
        lines.push(`⚠️ Acima do limite por ${CurrencyFormatters.formatBRL(total - budgetLimit)}`);
      } else {
        lines.push(`✅ Dentro do limite (Resta ${CurrencyFormatters.formatBRL(budgetLimit - total)})`);
      }
    }

    return lines.join('\n');
  };

  const handleShare = async () => {
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lista de Compras - Soma Fácil',
          text: text,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // Ignored
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Drawer modal */}
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

          {/* Title & Actions */}
          <div className="px-5 py-3 flex items-center justify-between border-b border-[#E9DADF]/60 dark:border-[#2B3547]/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#243041] dark:text-[#F3F6FC]">
                  Itens da Lista
                </h2>
                <p className="text-xs text-[#737B88] dark:text-[#A6B0C1]">
                  {items.length} {items.length === 1 ? 'item' : 'itens'} adicionados
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Limpar lista"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A] hover:bg-[#FFD5D9] dark:hover:bg-[#433039] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[220px]">
            {groupedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[#737B88] dark:text-[#A6B0C1]">
                <ShoppingBag className="w-12 h-12 opacity-30 mb-2" />
                <p className="font-bold text-sm">Sua lista está vazia</p>
                <p className="text-xs max-w-xs mt-1">
                  Adicione preços e produtos usando o teclado para acompanhar o total em tempo real.
                </p>
              </div>
            ) : (
              groupedItems.map((group, idx) => (
                <div
                  key={`${group.description || 'unnamed'}-${group.unitValue}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#1B2230] border border-[#E9DADF] dark:border-[#2B3547] shadow-xs"
                >
                  {/* Item info */}
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="font-bold text-sm text-[#243041] dark:text-[#F3F6FC] truncate">
                      {group.description || 'Item'}
                    </div>
                    <div className="text-xs text-[#737B88] dark:text-[#A6B0C1]">
                      {CurrencyFormatters.formatBRL(group.unitValue)} un.
                      {group.quantity > 1 && (
                        <span className="ml-1.5 font-bold text-[#FF4D57] dark:text-[#FF737A]">
                          = {CurrencyFormatters.formatBRL(group.totalValue)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDecrement(group)}
                      className="w-8 h-8 rounded-xl bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A] hover:bg-[#FFD5D9] dark:hover:bg-[#433039] flex items-center justify-center transition-all active:scale-95 cursor-pointer font-black"
                      title="Diminuir"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-7 text-center font-black text-sm text-[#243041] dark:text-[#F3F6FC]">
                      {group.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => onIncrement(group)}
                      className="w-8 h-8 rounded-xl bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A] hover:bg-[#FFD5D9] dark:hover:bg-[#433039] flex items-center justify-center transition-all active:scale-95 cursor-pointer font-black"
                      title="Aumentar"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveGroup(group)}
                      className="w-8 h-8 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition-colors ml-1"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Share */}
          <div className="p-4 bg-white dark:bg-[#1B2230] border-t border-[#E9DADF] dark:border-[#2B3547] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#737B88] dark:text-[#A6B0C1]">
                Total ({items.length} un.)
              </span>
              <span
                className={`text-2xl font-black ${
                  budgetStatus === 'exceeded'
                    ? 'text-[#FF2F38] dark:text-[#FF737A]'
                    : 'text-[#243041] dark:text-[#F3F6FC]'
                }`}
              >
                {CurrencyFormatters.formatBRL(total)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShare}
                disabled={items.length === 0}
                className="flex-1 py-3 px-4 rounded-xl bg-[#FF4D57] hover:bg-[#FF2F38] disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(255,77,87,0.3)] active:scale-98 transition-all cursor-pointer"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copiado para a área de transferência!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar Lista</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Clear Confirmation Modal */}
          {showClearConfirm && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-xs bg-white dark:bg-[#1B2230] rounded-2xl p-5 border border-[#E9DADF] dark:border-[#2B3547] shadow-xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#243041] dark:text-[#F3F6FC]">
                  Limpar todos os itens?
                </h3>
                <p className="text-xs text-[#737B88] dark:text-[#A6B0C1]">
                  Isso apagará todos os itens da lista atual. O limite de gasto continuará salvo.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-2 px-3 rounded-xl border border-[#E9DADF] dark:border-[#2B3547] text-xs font-bold text-[#737B88] dark:text-[#A6B0C1]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setShowClearConfirm(false);
                      onClose();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-sm"
                  >
                    Limpar tudo
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

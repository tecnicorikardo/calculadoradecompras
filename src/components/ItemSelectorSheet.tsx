import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Plus, Check } from 'lucide-react';
import { itemSuggestionsService } from '../services/itemSuggestionsService';

interface ItemSelectorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: string) => void;
}

export const ItemSelectorSheet: React.FC<ItemSelectorSheetProps> = ({
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const [query, setQuery] = useState('');
  const [customItems, setCustomItems] = useState<string[]>(() =>
    itemSuggestionsService.loadCustomItems()
  );

  const searchResults = useMemo(() => {
    return itemSuggestionsService.search(query, customItems);
  }, [query, customItems]);

  if (!isOpen) return null;

  const handleCreateAndSelect = () => {
    const cleaned = itemSuggestionsService.cleanItemName(query);
    if (!cleaned) return;

    itemSuggestionsService.saveCustomItem(cleaned);
    setCustomItems(itemSuggestionsService.loadCustomItems());
    onSelectItem(cleaned);
    onClose();
  };

  const handleSelect = (item: string) => {
    itemSuggestionsService.saveCustomItem(item);
    onSelectItem(item);
    onClose();
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
          className="relative z-10 w-full max-w-lg max-h-[85vh] flex flex-col bg-[#FFFBFC] dark:bg-[#161C28] rounded-t-3xl sm:rounded-3xl border border-[#E9DADF] dark:border-[#2B3547] shadow-2xl overflow-hidden"
        >
          {/* Header handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-[#FFCFD5] dark:bg-white/20" />
          </div>

          {/* Title and search */}
          <div className="px-5 py-3 border-b border-[#E9DADF]/60 dark:border-[#2B3547]/60 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#243041] dark:text-[#F3F6FC]">
                Itens Cadastrados
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A] hover:bg-[#FFD5D9] dark:hover:bg-[#433039] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-[#737B88] dark:text-[#A6B0C1]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar item (ex: Arroz, Café, Leite...)"
                autoFocus
                className="w-full bg-[#FFFEFD] dark:bg-[#1B2230] border border-[#E9DADF] dark:border-[#2B3547] rounded-xl pl-10 pr-10 py-2.5 text-sm font-bold text-[#243041] dark:text-[#F3F6FC] placeholder-[#737B88]/60 focus:border-[#FF4D57] outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 p-1 text-[#737B88] hover:text-[#243041]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Results list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 min-h-[280px]">
            {query.trim() && (
              <button
                type="button"
                onClick={handleCreateAndSelect}
                className="w-full flex items-center gap-2 p-3 rounded-xl bg-[#FFECEE] dark:bg-[#342129] text-[#FF4D57] dark:text-[#FF737A] font-bold text-sm hover:bg-[#FFD5D9] transition-colors cursor-pointer mb-2"
              >
                <Plus className="w-4 h-4" />
                <span>Usar &quot;{query.trim()}&quot;</span>
              </button>
            )}

            {searchResults.length === 0 ? (
              <div className="py-12 text-center text-[#737B88] dark:text-[#A6B0C1] text-xs font-semibold">
                Nenhum item encontrado com esse termo.
              </div>
            ) : (
              searchResults.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1B2230] border border-[#E9DADF] dark:border-[#2B3547] hover:border-[#FF4D57] dark:hover:border-[#FF5C64] hover:bg-[#FFECEE]/30 dark:hover:bg-[#342129]/30 text-left transition-all active:scale-99 cursor-pointer"
                >
                  <span className="font-bold text-sm text-[#243041] dark:text-[#F3F6FC]">
                    {item}
                  </span>
                  <Check className="w-4 h-4 text-[#FF4D57] dark:text-[#FF737A] opacity-0 hover:opacity-100 transition-opacity" />
                </button>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

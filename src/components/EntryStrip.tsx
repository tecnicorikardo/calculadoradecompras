import React from 'react';
import { ListFilter } from 'lucide-react';

interface EntryStripProps {
  description: string;
  onDescriptionChange: (val: string) => void;
  priceDigits: string; // raw digits or formatted string
  onOpenItemCatalog: () => void;
  onClearInput?: () => void;
}

export const EntryStrip: React.FC<EntryStripProps> = ({
  description,
  onDescriptionChange,
  priceDigits,
  onOpenItemCatalog,
}) => {
  // Format digits to currency representation: e.g. "1550" -> "15,50"
  const formattedPrice = React.useMemo(() => {
    if (!priceDigits || priceDigits === '0') {
      return 'R$ 0,00';
    }
    const num = parseInt(priceDigits, 10);
    if (isNaN(num)) return 'R$ 0,00';
    const val = num / 100;
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }, [priceDigits]);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-stretch gap-2 sm:gap-3 w-full h-16 sm:h-16">
        {/* Description input */}
        <div className="flex-1 bg-[#FFFEFD] dark:bg-[#1B2230] rounded-2xl border border-[#E9DADF] dark:border-[#2B3547] px-3 sm:px-4 flex items-center shadow-xs focus-within:border-[#FF4D57] focus-within:shadow-[0_0_0_3px_rgba(255,77,87,0.12)] transition-all">
          <input
            type="text"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Nome do produto (opcional)"
            className="w-full bg-transparent border-none outline-none font-semibold text-sm sm:text-base text-[#243041] dark:text-[#F3F6FC] placeholder-[#A6B0C1]/80 dark:placeholder-[#737B88]/80"
          />
        </div>

        {/* Amount display box */}
        <div className="w-36 sm:w-44 bg-[#FFFEFD] dark:bg-[#1B2230] rounded-2xl border-2 border-[#FF4D57] dark:border-[#FF5C64] p-2 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(255,77,87,0.15)] shrink-0 select-none">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-[#A6B0C1] dark:text-[#737B88]">
            Valor
          </span>
          <span className="font-black text-xl sm:text-2xl text-[#FF4D57] dark:text-[#FF737A] tracking-tight truncate max-w-full leading-tight">
            {formattedPrice}
          </span>
        </div>
      </div>

      {/* Catalog quick button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onOpenItemCatalog}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#FFFEFD] dark:bg-[#1B2230] border border-[#E9DADF] dark:border-[#2B3547] text-[#737B88] dark:text-[#A6B0C1] hover:border-[#FF4D57]/40 hover:text-[#FF4D57] dark:hover:text-[#FF737A] text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Itens cadastrados</span>
        </button>
      </div>
    </div>
  );
};

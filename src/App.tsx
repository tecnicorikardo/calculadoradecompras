import React, { useState, useEffect, useCallback } from 'react';
import { useShopping } from './hooks/useShopping';
import { usePro } from './hooks/usePro';
import { appPreferencesService } from './services/appPreferencesService';
import { ThemeMode } from './types';
import { Header } from './components/Header';
import { TotalCard } from './components/TotalCard';
import { LastItemCard } from './components/LastItemCard';
import { EntryStrip } from './components/EntryStrip';
import { NumericKeypad } from './components/NumericKeypad';
import { ItemsBottomSheet } from './components/ItemsBottomSheet';
import { ItemSelectorSheet } from './components/ItemSelectorSheet';
import { SettingsModal } from './components/SettingsModal';
import { UpgradeModal } from './components/UpgradeModal';
import { PaywallGate } from './components/PaywallGate';
import { itemSuggestionsService } from './services/itemSuggestionsService';

export const App: React.FC = () => {
  const {
    items,
    budgetLimit,
    isLoading,
    total,
    itemCount,
    lastItem,
    budgetStatus,
    groupedItems,
    addItem,
    incrementGroup,
    decrementGroup,
    removeGroup,
    updateBudgetLimit,
    clearItems,
  } = useShopping();

  const pro = usePro();

  // Theme mode
  const [themeMode, setThemeMode] = useState<ThemeMode>(() =>
    appPreferencesService.loadThemeMode()
  );

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    appPreferencesService.saveThemeMode(themeMode);
  }, [themeMode]);

  // Input states
  const [description, setDescription] = useState('');
  const [priceDigits, setPriceDigits] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2800);
  }, []);

  // Keypad operations
  const handleDigit = useCallback((digit: string) => {
    setPriceDigits((prev) => {
      if (prev.length >= 9) return prev; // max safe currency digits
      if (digit === '00') {
        if (!prev || prev === '0') return '0';
        return prev + '00';
      }
      if (prev === '0' && digit !== '0') return digit;
      return prev + digit;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setPriceDigits((prev) => (prev.length > 0 ? prev.slice(0, -1) : ''));
  }, []);

  const handleClear = useCallback(() => {
    setPriceDigits('');
    setDescription('');
  }, []);

  const handleAddItem = useCallback(() => {
    if (!priceDigits || priceDigits === '0') {
      showToast('Digite o valor do produto para continuar.');
      return;
    }

    const num = parseInt(priceDigits, 10);
    if (isNaN(num) || num <= 0) {
      showToast('Use o teclado numérico para montar um valor válido.');
      return;
    }

    const value = num / 100;
    const cleanDesc = itemSuggestionsService.cleanItemName(description);

    addItem(value, cleanDesc);
    if (cleanDesc) {
      itemSuggestionsService.saveCustomItem(cleanDesc);
    }

    // Reset input fields
    setPriceDigits('');
    setDescription('');
  }, [priceDigits, description, addItem, showToast]);

  const handleSelectItemFromCatalog = useCallback((item: string) => {
    setDescription(item);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-[#FFFCF8] dark:bg-[#0E1118]">
        <div className="w-8 h-8 rounded-full border-3 border-[#FF4D57] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-radial from-[#FFFCF8] via-[#FFF4F5] to-[#F6F2F8] dark:from-[#232A37] dark:via-[#171C28] dark:to-[#0E1118] text-[#243041] dark:text-[#F3F6FC] transition-colors duration-200 flex flex-col justify-between overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 px-4 py-2 rounded-2xl bg-[#243041] dark:bg-white text-white dark:text-[#243041] text-xs sm:text-sm font-bold shadow-xl animate-fade-in pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* Main Container */}
      <main className="w-full max-w-md md:max-w-lg mx-auto flex-1 flex flex-col p-3 sm:p-4 gap-2.5 justify-between">
        {!pro.hasAccess ? (
          <PaywallGate onOpenUpgrade={() => setIsUpgradeOpen(true)} />
        ) : (
          <>
            {/* Top Bar Header */}
            <Header
              budgetStatus={budgetStatus}
              budgetLimit={budgetLimit}
              total={total}
              isPro={pro.isPro}
              isTrialActive={pro.isTrialActive}
              trialDaysRemaining={pro.trialDaysRemaining}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
            />

            {/* Total Card */}
            <TotalCard
              total={total}
              budgetStatus={budgetStatus}
              budgetLimit={budgetLimit}
            />

            {/* Last Item Card */}
            <LastItemCard
              lastItem={lastItem}
              groupedItems={groupedItems}
            />

            {/* Entry Strip: description input + price display */}
            <EntryStrip
              description={description}
              onDescriptionChange={setDescription}
              priceDigits={priceDigits}
              onOpenItemCatalog={() => setIsCatalogOpen(true)}
              onClearInput={handleClear}
            />

            {/* Numeric Keypad & Cart Trigger */}
            <NumericKeypad
              onDigit={handleDigit}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onAdd={handleAddItem}
              onOpenCart={() => setIsCartOpen(true)}
              itemCount={itemCount}
            />
          </>
        )}
      </main>

      {/* Drawers / Modals */}
      <ItemsBottomSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        groupedItems={groupedItems}
        total={total}
        budgetLimit={budgetLimit}
        budgetStatus={budgetStatus}
        onIncrement={incrementGroup}
        onDecrement={decrementGroup}
        onRemoveGroup={removeGroup}
        onClearAll={clearItems}
      />

      <ItemSelectorSheet
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectItem={handleSelectItemFromCatalog}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        budgetLimit={budgetLimit}
        onUpdateBudgetLimit={updateBudgetLimit}
        themeMode={themeMode}
        onThemeModeChanged={setThemeMode}
        isPro={pro.isPro}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onResetTrial={pro.resetTrial}
        onExpireTrial={pro.expireTrial}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onActivated={pro.activatePro}
      />
    </div>
  );
};

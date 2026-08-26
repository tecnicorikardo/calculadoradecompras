export interface ShoppingItem {
  id: string;
  value: number;
  createdAt: string;
  description?: string | null;
}

export interface GroupedItem {
  description?: string | null;
  unitValue: number;
  quantity: number;
  ids: string[];
  totalValue: number;
}

export interface ShoppingSession {
  items: ShoppingItem[];
  budgetLimit: number | null;
}

export type BudgetStatus = 'normal' | 'attention' | 'exceeded';

export type ThemeMode = 'light' | 'dark';

export type AmountFieldTarget = 'budget' | 'product';

export interface PixPaymentData {
  qrcode: string;
  qrcode_image?: string;
  txid: string;
  amount: number;
}

export interface ProState {
  isPro: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  isLoading: boolean;
  hasAccess: boolean;
}

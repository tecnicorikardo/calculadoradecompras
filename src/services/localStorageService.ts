import { ShoppingItem, ShoppingSession } from '../types';
import { InitialShoppingItems } from '../data/initialShoppingItems';

const BUDGET_LIMIT_KEY = 'budget_limit';
const ITEMS_KEY = 'shopping_items';
const INITIAL_ITEMS_SEEDED_KEY = 'initial_items_seeded_v1';

export class LocalStorageService {
  loadSession(): ShoppingSession {
    try {
      const budgetLimitRaw = localStorage.getItem(BUDGET_LIMIT_KEY);
      const budgetLimit = budgetLimitRaw ? parseFloat(budgetLimitRaw) : null;
      const rawItems = this.loadOrSeedItems();

      return {
        budgetLimit: isNaN(budgetLimit ?? NaN) ? null : budgetLimit,
        items: rawItems,
      };
    } catch {
      return {
        budgetLimit: null,
        items: InitialShoppingItems.create(),
      };
    }
  }

  private loadOrSeedItems(): ShoppingItem[] {
    const savedItemsRaw = localStorage.getItem(ITEMS_KEY);
    const initialItemsSeeded = localStorage.getItem(INITIAL_ITEMS_SEEDED_KEY) === 'true';

    if (initialItemsSeeded || (savedItemsRaw && savedItemsRaw.length > 0)) {
      if (!initialItemsSeeded) {
        localStorage.setItem(INITIAL_ITEMS_SEEDED_KEY, 'true');
      }
      try {
        const parsed = JSON.parse(savedItemsRaw || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    const initial = InitialShoppingItems.create();
    localStorage.setItem(ITEMS_KEY, JSON.stringify(initial));
    localStorage.setItem(INITIAL_ITEMS_SEEDED_KEY, 'true');
    return initial;
  }

  saveSession(session: ShoppingSession): void {
    try {
      localStorage.setItem(ITEMS_KEY, JSON.stringify(session.items));
      localStorage.setItem(INITIAL_ITEMS_SEEDED_KEY, 'true');

      if (session.budgetLimit === null || session.budgetLimit === undefined) {
        localStorage.removeItem(BUDGET_LIMIT_KEY);
      } else {
        localStorage.setItem(BUDGET_LIMIT_KEY, session.budgetLimit.toString());
      }
    } catch (e) {
      console.error('Failed to save session to localStorage:', e);
    }
  }
}

export const localStorageService = new LocalStorageService();

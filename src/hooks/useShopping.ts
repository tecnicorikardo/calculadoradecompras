import { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingItem, ShoppingSession, GroupedItem, BudgetStatus } from '../types';
import { localStorageService } from '../services/localStorageService';

export function useShopping() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from storage
  useEffect(() => {
    const session = localStorageService.loadSession();
    setItems(session.items);
    setBudgetLimit(session.budgetLimit);
    setIsLoading(false);
  }, []);

  // Save changes
  const saveState = useCallback((newItems: ShoppingItem[], newBudgetLimit: number | null) => {
    const session: ShoppingSession = {
      items: newItems,
      budgetLimit: newBudgetLimit,
    };
    localStorageService.saveSession(session);
  }, []);

  const total = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.value, 0);
  }, [items]);

  const itemCount = items.length;

  const lastItem = useMemo(() => {
    return items.length > 0 ? items[items.length - 1] : null;
  }, [items]);

  const budgetStatus: BudgetStatus = useMemo(() => {
    if (budgetLimit === null || budgetLimit <= 0) {
      return 'normal';
    }
    if (total >= budgetLimit) {
      return 'exceeded';
    }
    if (total >= budgetLimit * 0.9) {
      return 'attention';
    }
    return 'normal';
  }, [total, budgetLimit]);

  const groupedItems = useMemo<GroupedItem[]>(() => {
    const map = new Map<string, GroupedItem>();

    for (const item of items) {
      const descKey = (item.description || '').trim().toLowerCase();
      const key = `${descKey}__${item.value.toFixed(2)}`;

      const existing = map.get(key);
      if (existing) {
        existing.quantity += 1;
        existing.ids.push(item.id);
        existing.totalValue += item.value;
      } else {
        map.set(key, {
          description: item.description?.trim() || null,
          unitValue: item.value,
          quantity: 1,
          ids: [item.id],
          totalValue: item.value,
        });
      }
    }

    return Array.from(map.values());
  }, [items]);

  const addItem = useCallback((value: number, description?: string) => {
    const cleanDesc = description?.trim() || null;
    const newItem: ShoppingItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      value,
      description: cleanDesc,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => {
      const updated = [...prev, newItem];
      saveState(updated, budgetLimit);
      return updated;
    });
  }, [budgetLimit, saveState]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveState(updated, budgetLimit);
      return updated;
    });
  }, [budgetLimit, saveState]);

  const removeGroup = useCallback((group: GroupedItem) => {
    const idsToRemove = new Set(group.ids);
    setItems((prev) => {
      const updated = prev.filter((item) => !idsToRemove.has(item.id));
      saveState(updated, budgetLimit);
      return updated;
    });
  }, [budgetLimit, saveState]);

  const incrementGroup = useCallback((group: GroupedItem) => {
    addItem(group.unitValue, group.description || undefined);
  }, [addItem]);

  const decrementGroup = useCallback((group: GroupedItem) => {
    if (group.ids.length === 0) return;
    const lastId = group.ids[group.ids.length - 1];
    removeItem(lastId);
  }, [removeItem]);

  const updateBudgetLimit = useCallback((limit: number | null) => {
    setBudgetLimit(limit);
    saveState(items, limit);
  }, [items, saveState]);

  const clearItems = useCallback(() => {
    setItems([]);
    saveState([], budgetLimit);
  }, [budgetLimit, saveState]);

  return {
    items,
    budgetLimit,
    isLoading,
    total,
    itemCount,
    lastItem,
    budgetStatus,
    groupedItems,
    addItem,
    removeItem,
    removeGroup,
    incrementGroup,
    decrementGroup,
    updateBudgetLimit,
    clearItems,
  };
}

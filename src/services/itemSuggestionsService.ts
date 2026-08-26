import { DefaultItemCatalog } from '../data/defaultItemCatalog';

const CUSTOM_ITEMS_KEY = 'custom_item_suggestions_v1';

export class ItemSuggestionsService {
  getDefaultItems(): string[] {
    return DefaultItemCatalog;
  }

  loadCustomItems(): string[] {
    try {
      const raw = localStorage.getItem(CUSTOM_ITEMS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return this.deduplicate(Array.isArray(parsed) ? parsed : []);
    } catch {
      return [];
    }
  }

  saveCustomItem(item: string): boolean {
    const cleanedItem = this.cleanItemName(item);
    if (!cleanedItem) {
      return false;
    }

    const customItems = this.loadCustomItems();
    if (
      this.containsNormalized(DefaultItemCatalog, cleanedItem) ||
      this.containsNormalized(customItems, cleanedItem)
    ) {
      return false;
    }

    const updatedItems = [...customItems, cleanedItem].sort((a, b) =>
      this.normalize(a).localeCompare(this.normalize(b))
    );

    try {
      localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(updatedItems));
      return true;
    } catch {
      return false;
    }
  }

  search(query: string, customItems: string[] = [], limit = 500): string[] {
    const items = this.mergeItems(customItems);
    const normalizedQuery = this.normalize(query);
    if (!normalizedQuery) {
      return items.slice(0, limit);
    }

    const startsWithMatches: string[] = [];
    const containsMatches: string[] = [];

    for (const item of items) {
      const normalizedItem = this.normalize(item);
      if (normalizedItem.startsWith(normalizedQuery)) {
        startsWithMatches.push(item);
      } else if (normalizedItem.includes(normalizedQuery)) {
        containsMatches.push(item);
      }
    }

    return [...startsWithMatches, ...containsMatches].slice(0, limit);
  }

  cleanItemName(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  private mergeItems(customItems: string[]): string[] {
    return this.deduplicate([...DefaultItemCatalog, ...customItems]);
  }

  private deduplicate(items: string[]): string[] {
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const item of items) {
      const cleaned = this.cleanItemName(item);
      if (!cleaned) continue;
      const norm = this.normalize(cleaned);
      if (!seen.has(norm)) {
        seen.add(norm);
        unique.push(cleaned);
      }
    }

    return unique;
  }

  private containsNormalized(items: string[], item: string): boolean {
    const norm = this.normalize(item);
    return items.some((candidate) => this.normalize(candidate) === norm);
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}

export const itemSuggestionsService = new ItemSuggestionsService();

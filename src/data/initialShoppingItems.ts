import { ShoppingItem } from '../types';

export class InitialShoppingItems {
  static create(): ShoppingItem[] {
    const now = new Date();
    return [
      {
        id: 'initial-1',
        description: 'Arroz',
        value: 15.50,
        createdAt: new Date(now.getTime() - 500000).toISOString(),
      },
      {
        id: 'initial-2',
        description: 'Feijão',
        value: 8.90,
        createdAt: new Date(now.getTime() - 400000).toISOString(),
      },
      {
        id: 'initial-3',
        description: 'Óleo',
        value: 6.75,
        createdAt: new Date(now.getTime() - 300000).toISOString(),
      },
      {
        id: 'initial-4',
        description: 'Açúcar',
        value: 4.30,
        createdAt: new Date(now.getTime() - 200000).toISOString(),
      },
      {
        id: 'initial-5',
        description: 'Café',
        value: 14.20,
        createdAt: new Date(now.getTime() - 100000).toISOString(),
      },
      {
        id: 'initial-6',
        description: 'Leite',
        value: 4.89,
        createdAt: now.toISOString(),
      },
    ];
  }
}

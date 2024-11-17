export interface BillViewOwner {
    id: string;
    expenseId: number;
    description: string;
    providerId: number;
    providerDescription: string;
    expenseDate: [number, number, number];
    expenseType: string;
    categoryDescription: string;
    categoryId: number;
    amount: number;
  }
  
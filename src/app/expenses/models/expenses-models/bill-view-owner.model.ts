export interface BillViewOwner {
    id: string;
    expenseId: number;
    description: string;
    providerId: string | number;
    expenseDate: [number, number, number];
    expenseType: string;
    categoryDescription: string;
    amount: number;
  }
  
export interface ExpenseGetById{
    id: number;
  category: string;
  categoryId: number;
  provider: string;
  providerId: number;
  description: string;
  amount: number;
  expenseType: string;
  expenseDate: string;
  fileId: string;
  invoiceNumber: string;
  distributionList: {
    ownerId: number;
    ownerFullName: string;
    amount: number;
    proportion: number;
  }[];
  installmentList: {
    paymentDate: [number, number, number]; // [year, month, day]
    installmentNumber: number;
  }[];
}
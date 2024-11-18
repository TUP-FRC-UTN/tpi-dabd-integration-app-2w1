export interface ExpensePaymentUpdateDTO {
    expenseId: number;
    status: string;
    paymentId: string;
    paymentPlatform: string;
    amount: number;
    paymentMethod:string;
  }

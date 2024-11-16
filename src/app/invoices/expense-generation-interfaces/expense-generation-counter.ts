export interface ExpenseGenerationCounter {
    ownerId: number;
    period: string;
    issueDate: number[];
    firstExpirationDate: number[];
    secondExpirationDate: number[];
    firstExpirationAmount: number;
    amountPayed: number;
    status: string;
    approved: boolean;
    paymentPlatform: string;
    paymentMethod: string | null;
    paymentIntentId: string;
  }
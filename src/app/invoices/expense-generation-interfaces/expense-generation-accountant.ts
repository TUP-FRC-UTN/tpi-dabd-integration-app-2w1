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

  export interface Kpi {

    amount: number,
    title: string,
    subTitle: string,
    tooltip: string,
    customStyles: { [key: string]: string },
    icon: string,
    formatPipe: string
  }

  export interface DebtorInfo{
    ownerId: number;
    ownerName: string;
    totalDebt: number;
    oldestDebtDays: number;
    averageDebtDays: number;
    totalBills: number;
    unpaidBills: number;
    oldestDebtDate?: Date;  
}

export interface PaymentMethod {
  id: string;
  name: string;
}

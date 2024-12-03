export interface ExpenseGenerationExpenseInterface {

    id: number;
    owner_id : number;
    dni_type : string;
    period: string;
    issueDate: Date;
    status: string;
    uuid: string;
    first_expiration_date: string;
    first_expiration_amount: number;
    second_expiration_date: string;
    second_expiration_amount: number;
    actual_amount: number;
    amount_payed: number;
    payment_method: string;
    payment_platform: string;
    payment_id: string;
    selected?: boolean;
    paymentDate?: Date;   
}

export interface DebtorExpense {
    owner_id: number;
    ownerName: string;
    period: string;
    uuid: string;
    second_expiration_date: string;
    first_expiration_amount: number;
    second_expiration_amount: number;
    actual_amount: number;
}

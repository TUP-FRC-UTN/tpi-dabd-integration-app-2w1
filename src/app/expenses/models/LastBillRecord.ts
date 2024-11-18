import { kpiExpense } from "./kpiExpense";

export interface LastBillRecord {
    id:number;
    bills: kpiExpense[];
    start_date: string;
    end_date: string;
    fineAmount: number;
    pendingAmount: number;
}

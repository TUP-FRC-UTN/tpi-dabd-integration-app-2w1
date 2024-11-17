import { DistributionList } from "./distributionList";
import { Instalmentlist } from "./installmentList";

export interface Bill {
    id: number;
    category: string;
    categoryId: number;
    provider: string;
    providerId: number;
    amount: number;
    expenseType: string;
    expenseDate: string;
    file : string;
    distributionList : DistributionList[];
    instalmentlist : Instalmentlist[];
}

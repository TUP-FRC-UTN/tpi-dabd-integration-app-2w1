import { DistributionList } from "./distributionList";
import { Instalmentlist } from "./installmentList";

export interface Bill {
    id: number;
    category: string;
    provider: string;
    amount: number;
    expenseType: string;
    expenseDate: string;
    file : string;
    distributionList : DistributionList[];
    instalmentlist : Instalmentlist[];
}

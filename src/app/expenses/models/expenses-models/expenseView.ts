import { DistributionList } from "./distributionList";
import { Expense } from "./expense";
import { Instalmentlist } from "./installmentList";

export interface ExpenseView extends Expense {
    categoryName: string;
    providerName: string;
    fileId: string;
    distributionList : DistributionList[];
    installmentList: Instalmentlist[];
}
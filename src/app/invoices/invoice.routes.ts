import { Routes } from "@angular/router";
import { InvoiceHomeComponent } from "./invoice-home/invoice-home.component";
import { ExpenseGenerationAdminViewComponent } from "./expense-generation-admin-view/expense-generation-admin-view.component";
import { ExpenseGenerationUserViewComponent } from "./expense-generation-user-view/expense-generation-user-view.component";
import { ExpenseGenerationViewComponent } from "./expense-generation-view/expense-generation-view.component";

export const INVOICE_ROUTES: Routes = [
    { path: '', component: InvoiceHomeComponent },
    { path: '', component: ExpenseGenerationViewComponent },
    { path: 'expense-generation-admin-view', component: ExpenseGenerationAdminViewComponent },
    {path: 'expense-generation-user-view', component: ExpenseGenerationUserViewComponent},
    // {path: 'expense-generation-accountant-view', component: ExpenseGenerationAccountantViewComponent},
    { path: '**', redirectTo: '' }
   
];
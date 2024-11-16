import { Routes } from "@angular/router";
import { InvoiceHomeComponent } from "./invoice-home/invoice-home.component";
import { ExpenseGenerationAdminViewComponent } from "./expense-generation-admin-view/expense-generation-admin-view.component";
import { ExpenseGenerationUserViewComponent } from "./expense-generation-user-view/expense-generation-user-view.component";
import { ExpenseGenerationCounterView2Component } from "./expense-generation-counter-view-2/expense-generation-counter-view-2.component";
import { ExpenseGenerationPaymentFormComponent } from "./expense-generation-payment-form/expense-generation-payment-form.component";

export const INVOICE_ROUTES: Routes = [
    { path: '', component: InvoiceHomeComponent },
    { path: 'expense-generation-admin-view', component: ExpenseGenerationAdminViewComponent },
    { path: 'expense-generation-user-view', component: ExpenseGenerationUserViewComponent},
    {path: 'dashboard', component: ExpenseGenerationCounterView2Component},
    {path: 'expense-generation-payment-form', component: ExpenseGenerationPaymentFormComponent},
];
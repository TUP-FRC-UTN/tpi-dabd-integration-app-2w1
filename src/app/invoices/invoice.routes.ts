import { Routes } from "@angular/router";
import { InvoiceHomeComponent } from "./invoice-home/invoice-home.component";
import { ExpenseGenerationAdminViewComponent } from "./expense-generation-admin-view/expense-generation-admin-view.component";
import { ExpenseGenerationUserViewComponent } from "./expense-generation-user-view/expense-generation-user-view.component";
import { ExpenseGenerationCounterView2Component } from "./expense-generation-counter-view-2/expense-generation-counter-view-2.component";
import { ExpenseGenerationPaymentFormComponent } from "./expense-generation-payment-form/expense-generation-payment-form.component";
import { authGuard } from "../users/guards/auth.guard";
import { roleGuard } from "../users/guards/role.guard";

export const INVOICE_ROUTES: Routes = [
    {
        path: '',
        canActivateChild: [authGuard, roleGuard],
        data: { roles: ['SuperAdmin', 'Gerente finanzas', 'Propietario', 'Inquilino'] },
        children: [
            {
                path: 'expense-generation-admin-view', component: ExpenseGenerationAdminViewComponent,
                data: { roles: ['SuperAdmin', 'Gerente finanzas'] }
            },
            {
                path: 'expense-generation-user-view', component: ExpenseGenerationUserViewComponent,
                data: { roles: ['Inquilino', 'Propietario'] }
            },
            {
                path: 'dashboard', component: ExpenseGenerationCounterView2Component,
                data: { roles: ['SuperAdmin', 'Gerente finanzas'] }
            },
            {
                path: 'expense-generation-payment-form', component: ExpenseGenerationPaymentFormComponent,
                data: { roles: ['Propietario'] }
            },
        ]
    }
];
import { Routes } from "@angular/router";
import { ExpensesHomeComponent } from "./expenses-home/expenses-home.component";
import { ExpensesRegisterExpenseComponent } from "./components/expenses-register-expense/expenses-register-expense.component";
import { ReportExpenseComponent } from "./components/expenses-report/expenses-report.component";
import { ViewGastosAdminComponent } from "./components/expenses-view-expense-admin/expenses-view-expense-admin.component";
import { ViewOwnerExpenseComponent } from "./components/expenses-view-expense-owner/expenses-view-expense-owner.component";
import { ExpensesViewCategoryComponent } from "./components/expenses-view-category/expenses-view-category.component";
import { authGuard } from "../users/guards/auth.guard";
import { roleGuard } from "../notifications/guard";

export const EXPENSES_ROUTES: Routes = [
    {
        path: '',
        canActivateChild: [authGuard, roleGuard],
        data: { roles: ['SuperAdmin', 'Gerente finanzas', 'Propietario'] },
        children: [
            {
                path: 'view-expense-admin', component: ViewGastosAdminComponent,
                data: { roles: ['SuperAdmin', 'Gerente finanzas'] }
            },
            {
                path: 'register-expense/:id', component: ExpensesRegisterExpenseComponent,
                data: { roles: ['SuperAdmin', 'Gerente finanzas'] }
            },
            {
                path: 'register-expense', component: ExpensesRegisterExpenseComponent,
                data: { roles: ['SuperAdmin', 'Gerente finanzas'] }
            },
            {
                path: 'view-category', component: ExpensesViewCategoryComponent,
                data: { roles: ['SuperAdmin', 'Gerente finanzas'] }
            },
            {
                path: 'view-expense-owner', component: ViewOwnerExpenseComponent,
                data: { roles: ['Propietario'] }
            },
            {
                path: 'dashboard', component: ReportExpenseComponent,
                data: { roles: ['SuperAdmin', 'Gerente finanzas'] }
            },
        ]
    }
];
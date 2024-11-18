import { Routes } from "@angular/router";
import { ExpensesHomeComponent } from "./expenses-home/expenses-home.component";
import { ExpensesRegisterExpenseComponent } from "./components/expenses-register-expense/expenses-register-expense.component";
import { ReportExpenseComponent } from "./components/expenses-report/expenses-report.component";
import { ViewGastosAdminComponent } from "./components/expenses-view-expense-admin/expenses-view-expense-admin.component";
import { ViewOwnerExpenseComponent } from "./components/expenses-view-expense-owner/expenses-view-expense-owner.component";
import { ExpensesViewCategoryComponent } from "./components/expenses-view-category/expenses-view-category.component";

export const EXPENSES_ROUTES: Routes = [
    { path: '', component: ExpensesHomeComponent },
    { path: 'view-expense-admin', component: ViewGastosAdminComponent },
    { path: 'register-expense/:id', component: ExpensesRegisterExpenseComponent },
    { path: 'register-expense', component: ExpensesRegisterExpenseComponent },
    { path: 'view-category', component: ExpensesViewCategoryComponent },
    { path: 'view-expense-owner', component: ViewOwnerExpenseComponent },
    { path: 'dashboard', component: ReportExpenseComponent },
 
];
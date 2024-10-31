import { Routes } from "@angular/router";
import { ExpensesHomeComponent } from "./expenses-home/expenses-home.component";
import { AddBillComponent } from "./components/bills/add-bill/add-bill.component";
import { CategoryBillComponent } from "./components/bills/category-bill/category-bill.component";
import { AddChargeComponent } from "./components/cargo/add-charge/add-charge.component";
import { ListChargesComponent } from "./components/cargo/list-charges/list-charges.component";
import { ExpenseComponent } from "./components/expensas/getAll/expense/expense.component";
import { ListBillsComponent } from "./components/expenses_bills/list-bills/list-bills.component";
import { ExpensesLiquidationExpenseComponent } from "./components/liquidacion/expenses-liquidation-expense/expenses-liquidation-expense.component";
import { LiquidationExpenseDetailsComponent } from "./components/liquidacion/liquidation-expense-details/liquidation-expense-details.component";
import { ExpensesPeriodExpensesComponent } from "./components/period/expenses-period-expenses/expenses-period-expenses.component";
import { ExpensesPeriodListComponent } from "./components/period/expenses-period-list/expenses-period-list.component";

export const EXPENSES_ROUTES: Routes = [
    { path: '', component: ExpensesHomeComponent },
     // Ruta periodos - manejo del estado del periodo
  { path: 'periodo', component: ExpensesPeriodListComponent },
  { path: 'periodo/:period_id/expensas', component: ExpensesPeriodExpensesComponent },
  { path: 'periodo/:period_id/liquidacion', component: ExpensesLiquidationExpenseComponent },
  { path: 'periodo/:period_id/liquidacion/:id', component: LiquidationExpenseDetailsComponent },

  // Ruta expenses - CRUD de expensas
  { path: 'expenses', component: ExpenseComponent },
  // { path: 'expenses/nuevo', component: ListChargesComponent },
  // { path: 'expenses/modificar/:id', component: ListChargesComponent },

  // Rutas cargos - CRUD de cargos
  { path: 'cargos', component: ListChargesComponent },
  { path: 'cargos/nuevo', component: AddChargeComponent },
  { path: 'cargos/modificar/:id', component: LiquidationExpenseDetailsComponent },

  // Ruta bills - CRUD de gastos
  { path: 'gastos', component: ListBillsComponent },
  { path: 'gastos/nuevo', component: AddBillComponent },
  { path: 'gastos/modificar/:id', component: AddBillComponent },
  { path: 'gastos/categorias', component: CategoryBillComponent },

  // Ruta por defecto o de redirección (opcional)
  // { path: '', redirectTo: '', pathMatch: 'full' },
  // { path: '**', redirectTo: '' },
];
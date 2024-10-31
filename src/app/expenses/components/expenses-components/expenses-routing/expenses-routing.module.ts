import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ViewGastosAdminComponent } from '../expenses-view-expense-admin/expenses-view-expense-admin.component';
import { ExpensesRegisterExpenseComponent } from '../expenses-register-expense/expenses-register-expense.component';
import { ExpensesViewCategoryComponent } from '../expenses-view-category/expenses-view-category.component';
import { ViewOwnerExpenseComponent } from '../expenses-view-expense-owner/expenses-view-expense-owner.component';
import { ReportExpenseComponent } from '../expenses-report/expenses-report.component';

const routes : Routes = [
  { path: 'viewExpenseAdmin', component: ViewGastosAdminComponent },
  { path: 'registerExpense/:id', component: ExpensesRegisterExpenseComponent },
  { path: 'registerExpense', component: ExpensesRegisterExpenseComponent },
  { path: 'viewCategory', component: ExpensesViewCategoryComponent },
  { path: 'viewExpenseOwner', component: ViewOwnerExpenseComponent },
  { path: 'estadisticas', component: ReportExpenseComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ExpensesRoutingModule { }

//de alguna forma hay que conectar este archivo de routing al archivo principal de rutas
//supongo que es para que nosotros tengamos este archivo para manejar rutas y 
//el proyecto en si tenga el archivo app.routes.ts (que seria para todos los grupos)
//TODO conectar este archivo al app.routes.ts (preguntarle a usuarios como)
//Mateo

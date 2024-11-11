import { Routes } from "@angular/router";
import { InventoryEmployeeProviderHomeComponent } from "./inventory-employee-provider-home/inventory-employee-provider-home.component";
import { IepAttentionCallComponent } from "./iep-employees/components/iep-attention-call/iep-attention-call.component";
import { IepChargesComponent } from "./iep-employees/components/iep-charges/iep-charges.component";
import { IEPFormPostEmployeesComponent } from "./iep-employees/components/iep-form-post-employees/iep-form-post-employees.component";
import { IepListEmployeesComponent } from "./iep-employees/components/iep-list-employees/iep-list-employees.component";
import { IepPerformancelistComponent } from "./iep-employees/components/iep-performancelist/iep-performancelist.component";
import { IepPutEmployeesComponent } from "./iep-employees/components/iep-put-employees/iep-put-employees.component";

export const EMPLOYEE_ROUTES: Routes = [
    { path: 'employees', component: IepListEmployeesComponent },
    { path: "register-employee", component: IEPFormPostEmployeesComponent },
    { path: 'attention-call', component: IepAttentionCallComponent },
    { path: 'performance', component: IepPerformancelistComponent },
    { path: 'employee/update/:id', component: IepPutEmployeesComponent },
    { path: 'charges', component: IepChargesComponent },
    { path: 'dashboard', component: InventoryEmployeeProviderHomeComponent }, // Cambiar por el componente correspondiente
];
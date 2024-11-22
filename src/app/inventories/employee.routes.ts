import { Routes } from "@angular/router";
import { IepAttentionCallComponent } from "./iep-employees/components/iep-attention-call/iep-attention-call.component";
import { IepChargesComponent } from "./iep-employees/components/iep-charges/iep-charges.component";
import { IEPFormPostEmployeesComponent } from "./iep-employees/components/iep-form-post-employees/iep-form-post-employees.component";
import { IepListEmployeesComponent } from "./iep-employees/components/iep-list-employees/iep-list-employees.component";
import { IepPerformancelistComponent } from "./iep-employees/components/iep-performancelist/iep-performancelist.component";
import { IepPutEmployeesComponent } from "./iep-employees/components/iep-put-employees/iep-put-employees.component";
import { IepChartsEmployeesComponent } from "./iep-employees/components/iep-charts-employees/iep-charts-employees.component";
import { IepPillowLaterArrivalConfigComponent } from "./iep-employees/components/iep-pillow-later-arrival-config/iep-pillow-later-arrival-config.component";
import { IepAttendancesComponent } from "./iep-employees/components/iep-attendances/iep-attendances.component";

export const EMPLOYEE_ROUTES: Routes = [
    { path: 'employees', component: IepListEmployeesComponent },
    { path: "register-employee", component: IEPFormPostEmployeesComponent },
    { path: "attendance/:id", component: IepAttendancesComponent },
    { path: 'attention-call', component: IepAttentionCallComponent },
    { path: 'performance/:id', component: IepPerformancelistComponent },
    { path: 'employee/update/:id', component: IepPutEmployeesComponent },
    { path: 'charges', component: IepChargesComponent },
    { path: 'pillow-late-arrival', component: IepPillowLaterArrivalConfigComponent },
    { path: 'dashboard', component: IepChartsEmployeesComponent }, // Cambiar por el componente correspondiente
];
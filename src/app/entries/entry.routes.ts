import { Routes } from "@angular/router";
import { AccessGlobalReportComponent } from "./components/entries_reports/entries-global-report/access-global-report.component";
import { AccessVehiclesViewComponent } from "./components/access_vehicles-register/access-vehicles-view/access-vehicles-view.component";
import { MetricsComponent } from "./components/metrics/metrics.component";
import { AccessRegisterVisitorsComponent } from "./components/access_visitors/access_visitors_register/access-register-visitors/access-register-visitors.component";

export const ENTRY_ROUTES: Routes = [
    { path: 'reports', component: AccessGlobalReportComponent },
    { path: 'visitor', component: AccessRegisterVisitorsComponent }, 
    { path: 'vehicles', component: AccessVehiclesViewComponent },
    { path: 'dashboard', component: MetricsComponent },
];
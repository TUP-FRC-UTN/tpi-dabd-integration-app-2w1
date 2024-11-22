import { Routes } from "@angular/router";
import { AccessGlobalReportComponent } from "./components/entries_reports/entries-global-report/access-global-report.component";
import { AccessVehiclesViewComponent } from "./components/access_vehicles-register/access-vehicles-view/access-vehicles-view.component";
import { AccessContainerVisitorsRegistrationComponent } from "./components/access_visitors/access_visitors_register/access-container-visitors-registration/access-container-visitors-registration.component";
import { MetricsComponent } from "./components/metrics/metrics.component";
import { authGuard } from "../users/guards/auth.guard";
import { roleGuard } from "../notifications/guard";

export const ENTRY_ROUTES: Routes = [
    {
        path: '',
        canActivateChild: [authGuard, roleGuard],
        data: { roles: ['SuperAdmin', 'Propietario', 'Inquilino', 'Familiar mayor'] },
        children: [
            {
                path: 'reports', component: AccessGlobalReportComponent,
                data: { roles: ['SuperAdmin', 'Seguridad'] }
            },
            {
                path: 'visitor', component: AccessContainerVisitorsRegistrationComponent,
                data: { roles: ['SuperAdmin', 'Propietario', 'Inquilino', 'Familiar mayor'] }
            },
            {
                path: 'vehicles', component: AccessVehiclesViewComponent,
                data: { roles: ['SuperAdmin', 'Seguridad'] }
            },
            {
                path: 'dashboard', component: MetricsComponent,
                data: { roles: ['SuperAdmin'] }
            },
        ]
    }

];
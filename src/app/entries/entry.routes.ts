import { Routes } from "@angular/router";
import { AccessVehiclesViewComponent } from "./components/access_vehicles-register/access-vehicles-view/access-vehicles-view.component";
import { AccessRegisterVisitorsComponent } from "./components/access_visitors/access_visitors_register/access-register-visitors/access-register-visitors.component";
import { roleWhitelistGuard } from "./guards/role-whitelist.guard";
import { AccesesUpdateAccesesComponent } from "./components/access_visitors/acceses-update-acceses/acceses-update-acceses/acceses-update-acceses.component";

export const ENTRY_ROUTES: Routes = [
    { 
        path: 'reports', 
        loadComponent: () => import('./components/entries_reports/entries-global-report/access-global-report.component').then(c => c.AccessGlobalReportComponent),
        canActivate: [roleWhitelistGuard], 
        data: {
            roles: ['Gerente General', 'Seguridad']
        } },
    { 
        path: 'visitor', 
        component: AccessRegisterVisitorsComponent,
        canActivate: [roleWhitelistGuard],
        data: {
            roles: ['Propietario', 'Inquilino', 'Gerente General']
        }
    },
    {
        path: 'accessesUpdate', 
        component: AccesesUpdateAccesesComponent,
        canActivate: [roleWhitelistGuard],
        data: {
            roles: ['Propietario', 'Inquilino', 'Gerente General']
        }
    },
    { 
        path: 'vehicles',
        component: AccessVehiclesViewComponent,
        canActivate: [roleWhitelistGuard],
        data: {
            roles: ['Gerente General', 'Propietario', 'Inquilino', 'Seguridad']
        }
    },
    { 
        path: 'dashboard', 
        loadComponent: () => import('./components/metrics/metrics.component').then(c => c.MetricsComponent),
        canActivate: [roleWhitelistGuard],
        data: {
            roles: ['Gerente General']
        }
    },
];
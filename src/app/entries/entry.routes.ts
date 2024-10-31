import { Routes } from "@angular/router";
import { EntryHomeComponent } from "./entry-home/entry-home.component";
import { AccessGeneralDashboardComponent } from "./components/access_dashboards/access-general-dashboard/access-general-dashboard.component";
import { AccessDailyFetchComponent } from "./components/access_entrys/access-daily-fetch/access-daily-fetch.component";
import { AccessGlobalReportComponent } from "./components/access_reports/access-global-report/access-global-report.component";
import { AccessEditComponent } from "./components/access_visitors/access-edit/access-edit.component";
import { AccessVisitorRegistryComponent } from "./components/access_visitors/access-visitor-registry/access-visitor-registry.component";
import { AccessContainerVisitorsRegistrationComponent } from "./components/access_visitors/access_visitors_register/access-container-visitors-registration/access-container-visitors-registration.component";

export const ENTRY_ROUTES: Routes = [
    { path: '', component: EntryHomeComponent },
    { path: '', redirectTo: 'reports', pathMatch: 'full' },
    { path: 'visitors', component: AccessVisitorRegistryComponent },
    { path: 'reports', component: AccessGlobalReportComponent },
    //{ path: 'entry', component: EntryComponent },
    { path: 'dashboards', component: AccessGeneralDashboardComponent },
    { path: 'entry', component: AccessDailyFetchComponent },
    { path: 'edit', component: AccessEditComponent },
    { path: 'visitor/register', component: AccessContainerVisitorsRegistrationComponent }
    
];
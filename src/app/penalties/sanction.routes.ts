import { Routes } from "@angular/router";
import { PenaltyHomeComponent } from "./penalty-home/penalty-home.component";
import { PenaltiesSanctionsReportListComponent } from "./components/sanctionsComponents/penalties-list-report/penalties-list-report.component";
import { PenaltiesPostFineComponent } from "./components/sanctionsComponents/penalties-post-fine/penalties-post-fine.component";
import { PenaltiesPostDisclaimerComponent } from "./components/sanctionsComponents/penalties-post-disclaimer/penalties-post-disclaimer.component";
import { PenaltiesSanctionsListComponent } from "./components/sanctionsComponents/penalties-list-sanctions/penalties-list-sanctions.component";
import { ReportModifyComponent } from "./components/sanctionsComponents/sanctions-update-report/sanctions-update-report.component";
import { NewReportComponent } from "./components/sanctionsComponents/penalties-post-report/penalties-post-report.component";
import { PenaltiesUpdateFineComponent } from "./components/sanctionsComponents/penalties-update-fine/penalties-update-fine.component";
import { PenaltiesFineDashboardComponent } from "./components/sanctionsComponents/penalties-fine-dashboard/penalties-fine-dashboard.component";
import { authGuard } from "../users/guards/auth.guard";
import { roleGuard } from "../users/guards/role.guard";


export const SANCTION_ROUTES: Routes = [
    {
        path: '',
        canActivateChild: [authGuard, roleGuard],
        data: { roles: ['SuperAdmin', 'Gerente multas', 'Propietario', 'Inquilino', 'Familiar mayor'] },
        children: [
            {
                path: 'report-list', component: PenaltiesSanctionsReportListComponent,
                data: { roles: ['SuperAdmin', 'Gerente multas'] }
            },
            {
                path: 'post-fine/:id', component: PenaltiesPostFineComponent,
                data: { roles: ['SuperAdmin', 'Gerente multas'] }
            },
            {
                path: 'post-disclaimer/:fineId', component: PenaltiesPostDisclaimerComponent,
                data: { roles: ['SuperAdmin', 'Gerente multas', 'Propietario', 'Inquilino', 'Familiar mayor'] }
            },
            {
                path: 'sanctions-list', component: PenaltiesSanctionsListComponent,
                data: { roles: ['SuperAdmin', 'Gerente multas', 'Propietario', 'Inquilino', 'Familiar mayor'] }
            },
            {
                path: 'put-report', component: ReportModifyComponent,
                data: { roles: ['SuperAdmin', 'Gerente multas'] }
            },
            {
                path: 'post-report', component: NewReportComponent,
                data: { roles: ['SuperAdmin', 'Gerente multas'] }
            },
            {
                path: 'put-fine/:fineId', component: PenaltiesUpdateFineComponent,
                data: { roles: ['SuperAdmin', 'Gerente multas'] }
            },
            {
                path: 'dashboard', component: PenaltiesFineDashboardComponent,
                data: { roles: ['SuperAdmin', 'Gerente multas'] }
            },
        ]
    }
];
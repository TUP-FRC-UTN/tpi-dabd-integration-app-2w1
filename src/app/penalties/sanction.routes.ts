import { Routes } from "@angular/router";
import { PenaltyHomeComponent } from "./penalty-home/penalty-home.component";
import { PenaltiesSanctionsReportListComponent } from "./components/sanctionsComponents/penalties-list-report/penalties-list-report.component";
import { PenaltiesPostFineComponent } from "./components/sanctionsComponents/penalties-post-fine/penalties-post-fine.component";
import { PenaltiesPostDisclaimerComponent } from "./components/sanctionsComponents/penalties-post-disclaimer/penalties-post-disclaimer.component";
import { PenaltiesSanctionsListComponent } from "./components/sanctionsComponents/penalties-list-sanctions/penalties-list-sanctions.component";
import { ReportModifyComponent } from "./components/sanctionsComponents/sanctions-update-report/sanctions-update-report.component";
import { NewReportComponent } from "./components/sanctionsComponents/penalties-post-report/penalties-post-report.component";
import { PenaltiesUpdateFineComponent } from "./components/sanctionsComponents/penalties-update-fine/penalties-update-fine.component";


export const SANCTION_ROUTES: Routes = [
    { path: 'report-list', component: PenaltiesSanctionsReportListComponent },
    { path: 'post-fine/:id', component: PenaltiesPostFineComponent },
    { path: 'post-disclaimer/:fineId', component: PenaltiesPostDisclaimerComponent },
    { path: 'sanctions-list', component: PenaltiesSanctionsListComponent },
    { path: 'put-report', component: ReportModifyComponent },
    { path: 'post-report', component: NewReportComponent },
    { path: 'put-fine/:fineId', component: PenaltiesUpdateFineComponent },
    { path: 'dashboard', component: PenaltyHomeComponent }, // Cambiar por el componente correspondiente
];
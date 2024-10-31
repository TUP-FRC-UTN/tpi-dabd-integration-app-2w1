import { Routes, RouterModule } from '@angular/router';
import { UsersNavbarComponent } from '../users-components/users-navbar/users-navbar.component';
import { PenaltiesSanctionsReportListComponent } from './penalties-list-report/penalties-list-report.component';
import { PenaltiesPostFineComponent } from './penalties-post-fine/penalties-post-fine.component';
import { PenaltiesPostDisclaimerComponent } from './penalties-post-disclaimer/penalties-post-disclaimer.component';
import { PenaltiesSanctionsListComponent } from './penalties-list-sanctions/penalties-list-sanctions.component';
import { ReportModifyComponent } from './sanctions-update-report/sanctions-update-report.component';
import { NewReportComponent } from './penalties-post-report/penalties-post-report.component';

export const routes: Routes = [
  {
    path: 'reportList',
    component: PenaltiesSanctionsReportListComponent,
  },
  {
    path: 'postFine/:id',
    component: PenaltiesPostFineComponent,
  },
  {
    path: 'postDisclaimer/:fineId',
    component: PenaltiesPostDisclaimerComponent,
  },
  {
    path: 'sanctionsList',
    component: PenaltiesSanctionsListComponent,
  },
  {
    path: 'putReport',
    component: ReportModifyComponent
  },
  {
    path: 'postReport',
    component: NewReportComponent
  }
];

export const SanctionRoutingRoutes = RouterModule.forChild(routes);

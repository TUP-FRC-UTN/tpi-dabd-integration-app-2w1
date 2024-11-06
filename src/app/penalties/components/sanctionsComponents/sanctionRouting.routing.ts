import { Routes, RouterModule } from '@angular/router';
import { UsersNavbarComponent } from '../../../common/components/users-navbar/users-navbar.component';
import { PenaltiesSanctionsReportListComponent } from './penalties-list-report/penalties-list-report.component';
import { PenaltiesPostFineComponent } from './penalties-post-fine/penalties-post-fine.component';
import { PenaltiesPostDisclaimerComponent } from './penalties-post-disclaimer/penalties-post-disclaimer.component';
import { PenaltiesSanctionsListComponent } from './penalties-list-sanctions/penalties-list-sanctions.component';
import { ReportModifyComponent } from './sanctions-update-report/sanctions-update-report.component';
import { NewReportComponent } from './penalties-post-report/penalties-post-report.component';
import { PenaltiesUpdateFineComponent } from './penalties-update-fine/penalties-update-fine.component';

export const routes: Routes = [
  {
    path: 'report-list',
    component: PenaltiesSanctionsReportListComponent,
  },
  {
    path: 'post-fine/:id',
    component: PenaltiesPostFineComponent,
  },
  {
    path: 'post-disclaimer/:fineId',
    component: PenaltiesPostDisclaimerComponent,
  },
  {
    path: 'sanctions-list',
    component: PenaltiesSanctionsListComponent,
  },
  {
    path: 'put-report',
    component: ReportModifyComponent
  },
  {
    path: 'post-report',
    component: NewReportComponent
  },
  {
    path: 'putFine/:fineId',
    component: PenaltiesUpdateFineComponent
  }
];

export const SanctionRoutingRoutes = RouterModule.forChild(routes);

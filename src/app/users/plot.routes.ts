import { Routes } from "@angular/router";
import { UsersListPlotsComponent } from "./users-components/plots/users-list-plots/users-list-plots.component";
import { UsersNewPlotComponent } from "./users-components/plots/users-new-plot/users-new-plot.component";
import { UsersUpdatePlotComponent } from "./users-components/plots/users-update-plot/users-update-plot.component";
import { UsersReportComponent } from "./users-components/dashboard/users-report/users-report.component";
import { UsersGraphicBlocksComponent } from "./users-components/dashboard/users-graphic-blocks/users-graphic-blocks.component";
import { UsersGraphicPlotsStatsComponent } from "./users-components/dashboard/users-graphic-plots-stats/users-graphic-plots-stats.component";
import { UsersGraphicPlotComponent } from "./users-components/dashboard/users-graphic-plot/users-graphic-plot.component";
import { authGuard } from "./guards/auth.guard";
import { roleGuard } from "../users/guards/role.guard";
import { UsersBuyRequestComponent } from "./users-components/plots/users-buy-request/users-buy-request.component";

export const PLOT_ROUTES: Routes = [
  {
    path: '',
    canActivateChild: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin', 'Gerente general'] },
    children: [
      { path: 'list', component: UsersListPlotsComponent },
      { path: 'add', component: UsersNewPlotComponent },
      { path: 'edit/:id', component: UsersUpdatePlotComponent },
      { path: 'requests', component: UsersBuyRequestComponent },
      { path: 'dashboard', component: UsersReportComponent },
      { path: 'dashboard/plot-blocks', component: UsersGraphicBlocksComponent },
      { path: 'dashboard/plot-info', component: UsersGraphicPlotsStatsComponent },
      { path: 'dashboard/plot', component: UsersGraphicPlotComponent }
    ]
  }
];
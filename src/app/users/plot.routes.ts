import { Routes } from "@angular/router";
import { UsersHomeComponent } from "../common/components/users-home/users-home.component";
import { UsersListPlotsComponent } from "./users-components/plots/users-list-plots/users-list-plots.component";
import { UsersNewPlotComponent } from "./users-components/plots/users-new-plot/users-new-plot.component";
import { UsersUpdatePlotComponent } from "./users-components/plots/users-update-plot/users-update-plot.component";
import { UsersReportComponent } from "./users-components/dashboard/users-report/users-report.component";
import { PlotsByBlock } from "./users-models/dashboard/plots-stats";
import { UsersGraphicBlocksComponent } from "./users-components/dashboard/users-graphic-blocks/users-graphic-blocks.component";
import { UsersGraphicPlotsStatsComponent } from "./users-components/dashboard/users-graphic-plots-stats/users-graphic-plots-stats.component";
import { UsersGraphicPlotComponent } from "./users-components/dashboard/users-graphic-plot/users-graphic-plot.component";

export const PLOT_ROUTES: Routes = [
  { path: 'list', component: UsersListPlotsComponent },
  { path: 'add', component: UsersNewPlotComponent },
  { path: 'edit/:id', component: UsersUpdatePlotComponent },
  { path: 'dashboard', component: UsersReportComponent},
  { path: 'dashboard/plot-blocks', component: UsersGraphicBlocksComponent},
  { path: 'dashboard/plot-info', component: UsersGraphicPlotsStatsComponent},
  { path: 'dashboard/plot', component: UsersGraphicPlotComponent}
];
import { Routes } from "@angular/router";
import { UserHomeComponent } from "./user-home/user-home.component";
import { UsersListPlotsComponent } from "./users-components/plots/users-list-plots/users-list-plots.component";
import { UsersNewPlotComponent } from "./users-components/plots/users-new-plot/users-new-plot.component";
import { UsersUpdatePlotComponent } from "./users-components/plots/users-update-plot/users-update-plot.component";

export const PLOT_ROUTES: Routes = [
  { path: 'list', component: UsersListPlotsComponent },
  { path: 'add', component: UsersNewPlotComponent },
  { path: 'edit/:id', component: UsersUpdatePlotComponent },
  { path: 'dashboard', component: UserHomeComponent }, // Cambiar por el componente correspondiente
];
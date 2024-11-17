import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersNewPlotComponent } from './users-new-plot/users-new-plot.component';
import { UsersUpdatePlotComponent } from './users-update-plot/users-update-plot.component';
import { UsersListPlotsComponent } from './users-list-plots/users-list-plots.component';

const routes: Routes = [
  {path: 'list',component: UsersListPlotsComponent},
  {path: 'add', component: UsersNewPlotComponent},
  {path: 'edit/:id', component: UsersUpdatePlotComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlotsRoutingModule { }

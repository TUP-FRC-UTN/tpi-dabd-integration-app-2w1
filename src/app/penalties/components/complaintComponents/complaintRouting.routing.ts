import { Routes, RouterModule } from '@angular/router';
import { PenaltiesPostComplaintComponent } from './penalties-post-complaint/penalties-post-complaint.component';
import { PenaltiesListComplaintComponent } from './penalties-list-complaints/penalties-list-complaints.component';

export const routes: Routes = [
  {
    path: 'listComplaint',
    component: PenaltiesListComplaintComponent,
  },
  {
    path: 'postComplaint',
    component: PenaltiesPostComplaintComponent,
  }
];

export const ComplaintRoutingRoutes = RouterModule.forChild(routes);

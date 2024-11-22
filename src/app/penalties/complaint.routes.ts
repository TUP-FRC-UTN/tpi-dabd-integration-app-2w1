import { Routes } from "@angular/router";
import { PenaltiesListComplaintComponent } from "../penalties/components/complaintComponents/penalties-list-complaints/penalties-list-complaints.component";
import { PenaltiesPostComplaintComponent } from "./components/complaintComponents/penalties-post-complaint/penalties-post-complaint.component";
import { PenaltiesComplaintDashboardComponent } from "./components/complaintComponents/penalties-complaint-dashboard/penalties-complaint-dashboard.component";
import { authGuard } from "../users/guards/auth.guard";
import { roleGuard } from "../notifications/guard";

export const COMPLAINT_ROUTES: Routes = [
    {
        path: '',
        canActivateChild: [authGuard, roleGuard],
        data: { roles: ['SuperAdmin', 'Gerente multas', 'Propietario', 'Inquilino', 'Familiar mayor'] },
        children: [
            {
                path: 'list-complaint', component: PenaltiesListComplaintComponent,
                data: { roles: ['SuperAdmin', 'Gerente multas'] }
            },
            {
                path: 'post-complaint', component: PenaltiesPostComplaintComponent,
                data: { roles: ['SuperAdmin', 'Gerente multas', 'Propietario', 'Inquilino', 'Familiar mayor'] }
            },
            {
                path: 'dashboard', component: PenaltiesComplaintDashboardComponent,
                data: { roles: ['SuperAdmin', 'Gerente multas'] }
            },
        ]
    }
];

import { Routes } from "@angular/router";
import { PenaltiesListComplaintComponent } from "../penalties/components/complaintComponents/penalties-list-complaints/penalties-list-complaints.component";
import { PenaltiesPostComplaintComponent } from "./components/complaintComponents/penalties-post-complaint/penalties-post-complaint.component";
import { PenaltiesComplaintDashboardComponent } from "./components/complaintComponents/penalties-complaint-dashboard/penalties-complaint-dashboard.component";

export const COMPLAINT_ROUTES: Routes = [
    { path: 'list-complaint', component: PenaltiesListComplaintComponent },
    { path: 'post-complaint', component: PenaltiesPostComplaintComponent },
    { path: 'dashboard', component: PenaltiesComplaintDashboardComponent },
];

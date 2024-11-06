import { Routes } from "@angular/router";
import { PenaltyHomeComponent } from "./penalty-home/penalty-home.component";
import { PenaltiesListComplaintComponent } from "./components/complaintComponents/penalties-list-complaints/penalties-list-complaints.component";
import { PenaltiesPostComplaintComponent } from "./components/complaintComponents/penalties-post-complaint/penalties-post-complaint.component";


export const COMPLAINT_ROUTES: Routes = [
    { path: 'list-complaint', component: PenaltiesListComplaintComponent },
    { path: 'post-complaint', component: PenaltiesPostComplaintComponent },
    { path: 'dashboard', component: PenaltyHomeComponent }, // Cambiar por el componente correspondiente
];
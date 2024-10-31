import { Routes } from "@angular/router";
import { PenaltyHomeComponent } from "./penalty-home/penalty-home.component";

export const PENALTY_ROUTES: Routes = [
   { path: '', component: PenaltyHomeComponent },
   { path: '', redirectTo: '/home', pathMatch: 'full' },
    {
        path: 'home', component: PenaltyHomeComponent,
        children: [
            {
                path: 'complaints',
                loadChildren: () => import('./components/complaintComponents/complaintRouting.routing').then(m => m.routes)
            },
            {
                path: 'sanctions',
                loadChildren: () => import('./components/sanctionsComponents/sanctionRouting.routing').then(m => m.routes)
            },
        ]
    }
   
];
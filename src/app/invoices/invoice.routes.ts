import { Routes } from "@angular/router";
import { InvoiceHomeComponent } from "./invoice-home/invoice-home.component";
import { AdminListExpensasComponent } from "./admin-list-expensas/admin-list-expensas.component";
import { OwnerListExpensasComponent } from "./owner-list-expensas/owner-list-expensas.component";
import { ReviewTicketsTransferComponent } from "./review-tickets-transfer/review-tickets-transfer.component";
import { StadisticsComponent } from "./stadistics/stadistics.component";

export const INVOICE_ROUTES: Routes = [
    { path: '', component: InvoiceHomeComponent },
    {
        path: 'admin-list-expensas',
        component: AdminListExpensasComponent
    },
    {
        path: 'owner-list-expensas',
        component: OwnerListExpensasComponent
    },
    {
        path: 'stadistics',
        component: StadisticsComponent
    },
    {
        path: 'review-tickets-transfer',
        component: ReviewTicketsTransferComponent
    },
    {
        path: '**',
        component: OwnerListExpensasComponent
    }
];
import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'entries',
        loadChildren: () => import("./entries/entry.routes").then((m) => m.ENTRY_ROUTES)
    },
    {
        path: 'invoices',
        loadChildren: () => import("./invoices/invoice.routes").then((m) => m.INVOICE_ROUTES)
    },
    {
        path: 'expenses',
        loadChildren: () => import("./expenses/expenses.routes").then((m) => m.EXPENSES_ROUTES)
    },
    {
        path: 'inventories',
        loadChildren: () => import("./inventories/inventory.routes").then((m) => m.INVENTORY_ROUTES)
    },
    {
        path: 'penalties',
        loadChildren: () => import("./penalties/penalty.routes").then((m) => m.PENALTY_ROUTES)
    },
    {
        path: 'notifications',
        loadChildren: () => import("./notifications/notification.routes").then((m) => m.NOTIFICATION_ROUTES)
    },
    {
        path: 'users',
        loadChildren: () => import("./users/user.routes").then((m) => m.USER_ROUTES)
    },
];

import { Routes } from '@angular/router';
import { LoginComponent } from './common/components/users-login/login.component';
import { LandingPageComponent } from './common/components/users-landing-page/landing-page.component';
import { MainComponent } from './common/components/main/main.component';
import { NotFoundComponent } from './common/components/not-found/not-found.component';
import { UsersRecoveryPasswordComponent } from './common/components/users-recovery-password/users-recovery-password.component';
import { UnauthorizedComponent } from './common/components/unauthorized/unauthorized.component';
import { UsersHomeComponent } from './common/components/users-home/users-home.component';

export const routes: Routes = [
    {
        //si se deja vacío por defecto redirige al login
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'home',
        component: LandingPageComponent
    },
    {
        path: 'main',
        component: MainComponent,
        children: [
            {
                path: 'home',
                component: UsersHomeComponent
            },
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
                path: 'employees',
                loadChildren: () => import('./inventories/employee.routes').then((m) => m.EMPLOYEE_ROUTES)
            },
            {
                path: 'providers',
                loadChildren: () => import('./inventories/providers.routes').then((m) => m.PROVIDERS_ROUTES)
            },
            {
                path: 'inventories',
                loadChildren: () => import("./inventories/inventory.routes").then((m) => m.INVENTORY_ROUTES)
            },
            {
                path: 'complaints',
                loadChildren: () => import("./penalties/complaint.routes").then((m) => m.COMPLAINT_ROUTES)
            },
            {
                path: 'sanctions',
                loadChildren: () => import("./penalties/sanction.routes").then((m) => m.SANCTION_ROUTES)
            },
            {
                path: 'notifications',
                loadChildren: () => import("./notifications/notification.routes").then((m) => m.NOTIFICATION_ROUTES)
            },
            {
                path: 'users',
                loadChildren: () => import("./users/user.routes").then((m) => m.USER_ROUTES)
            },
            {
                path: 'plots',
                loadChildren: () => import("./users/plot.routes").then((m) => m.PLOT_ROUTES)
            },
            {
                path: 'owners',
                loadChildren: () => import("./users/owner.routes").then((m) => m.OWNER_ROUTES)
            }
        ]
    },
    {
        path: '**',
        component: NotFoundComponent
    },
    {
        path: 'recovery',
        component: UsersRecoveryPasswordComponent
    },
    {
        path: 'unauthorized',
        component: UnauthorizedComponent
    },

];

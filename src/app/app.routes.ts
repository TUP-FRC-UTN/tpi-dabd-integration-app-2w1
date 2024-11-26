import { Routes } from '@angular/router';
import { LoginComponent } from './common/components/users-login/login.component';
import { LandingPageComponent } from './common/components/users-landing-page/landing-page.component';
import { MainComponent } from './common/components/main/main.component';
import { NotFoundComponent } from './common/components/not-found/not-found.component';
import { UsersRecoveryPasswordComponent } from './common/components/users-recovery-password/users-recovery-password.component';
import { UnauthorizedComponent } from './common/components/unauthorized/unauthorized.component';
import { UsersHomeComponent } from './common/components/users-home/users-home.component';
import { authGuard } from './users/guards/auth.guard';
import { roleGuard } from './users/guards/role.guard';
export const routes: Routes = [
    {
        //si se deja vacío por defecto redirige al login
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent,

    },
    {
        path: 'recovery',
        component: UsersRecoveryPasswordComponent
    },
    {
        path: 'home',
        component: LandingPageComponent
    },
    {
        path: 'main',
        component: MainComponent,
        canActivate: [authGuard],
        canActivateChild: [authGuard, roleGuard],
        children: [
            {
                path: 'home',
                component: UsersHomeComponent
            },
            {
                path: 'entries',
                loadChildren: () => import("./entries/entry.routes").then((m) => m.ENTRY_ROUTES),
                data: { roles: ['SuperAdmin', 'Propietario', 'Inquilino', 'Familiar mayor', 'Seguridad'] }
            },
            {
                path: 'invoices',
                loadChildren: () => import("./invoices/invoice.routes").then((m) => m.INVOICE_ROUTES),
                data: { roles: ['SuperAdmin', 'Inquilino', 'Propietario', 'Gerente finanzas'] }
            },
            {
                path: 'expenses',
                loadChildren: () => import("./expenses/expenses.routes").then((m) => m.EXPENSES_ROUTES),
                data: { roles: ['SuperAdmin', 'Gerente finanzas', 'Propietario'] }
            },
            {
                path: 'employees',
                loadChildren: () => import('./inventories/employee.routes').then((m) => m.EMPLOYEE_ROUTES),
                data: { roles: ['SuperAdmin', 'Gerente inventario'] }
            },
            {
                path: 'providers',
                loadChildren: () => import('./inventories/providers.routes').then((m) => m.PROVIDERS_ROUTES),
                data: { roles: ['SuperAdmin', 'Gerente inventario'] }
            },
            {
                path: 'inventories',
                loadChildren: () => import("./inventories/inventory.routes").then((m) => m.INVENTORY_ROUTES),
                data: { roles: ['SuperAdmin', 'Gerente inventario'] }
            },
            {
                path: 'complaints',
                loadChildren: () => import("./penalties/complaint.routes").then((m) => m.COMPLAINT_ROUTES),
                data: { roles: ['SuperAdmin', 'Gerente multas', 'Propietario', 'Inquilino', 'Familiar mayor'] }
            },
            {
                path: 'sanctions',
                loadChildren: () => import("./penalties/sanction.routes").then((m) => m.SANCTION_ROUTES),
                data: { roles: ['SuperAdmin', 'Gerente multas', 'Propietario', 'Inquilino', 'Familiar mayor'] }
            },
            {
                path: 'notifications',
                loadChildren: () => import("./notifications/notification.routes").then((m) => m.NOTIFICATION_ROUTES),
                data: { roles: ['SuperAdmin', 'Gerente general', 'Inquilino', 'Propietario', 'Familiar mayor', 'Familiar menor', 'Gerente multas', 'Gerente inventario', 'Gerente finanzas', 'Seguridad', 'Gerente empleados'] }
            {
                path: 'users',
                loadChildren: () => import("./users/user.routes").then((m) => m.USER_ROUTES),
                data: { roles: ['SuperAdmin', 'Gerente general', 'Inquilino', 'Propietario', 'Familiar mayor', 'Familiar menor', 'Gerente multas', 'Gerente inventario', 'Gerente finanzas', 'Seguridad', 'Gerente empleados'] }
            },
            {
                path: 'plots',
                loadChildren: () => import("./users/plot.routes").then((m) => m.PLOT_ROUTES),
                data: { roles: ['SuperAdmin', 'Gerente general'] }
            },
            {
                path: 'owners',
                loadChildren: () => import("./users/owner.routes").then((m) => m.OWNER_ROUTES),
                data: { roles: ['SuperAdmin', 'Gerente general'] }
            }
        ]
    },
    {
        path: 'unauthorized',
        component: UnauthorizedComponent
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];

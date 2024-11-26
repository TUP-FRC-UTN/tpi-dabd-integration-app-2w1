import { Routes } from "@angular/router";
import { NotificationHomeComponent } from "./notification-home/notification-home.component";
import { AllNotificationComponent } from "./components/all-notification/all-notification.component";
import { NotificationComponent } from "./components/notification/notification.component";
import { PostNotificationAdminComponent } from "./components/post-notification-admin/post-notification-admin.component";
import { roleGuard } from "../users/guards/role.guard";
import { authGuard } from "../users/guards/auth.guard";

export const NOTIFICATION_ROUTES: Routes = [
  {
    path: '',
    canActivateChild: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin', 'Gerente general', 'Inquilino', 'Propietario', 'Familiar mayor', 'Familiar menor', 'Gerente multas', 'Gerente inventario', 'Gerente finanzas', 'Seguridad', 'Gerente empleados'] },
    children: [
      {
        path: "show", component: NotificationComponent,
        // data: { roles: ['SuperAdmin', 'Gerente general', 'Inquilino', 'Propietario', 'Familiar mayor', 'Familiar menor', 'Gerente multas', 'Gerente inventario', 'Gerente finanzas', 'Seguridad', 'Gerente empleados'] }
      },
      {
        path: "admin-post-notification", component: PostNotificationAdminComponent,
        data: { roles: ['SuperAdmin'] }
      },
      {
        path: "admin-all-notifications", component: AllNotificationComponent,
        data: { roles: ['SuperAdmin'] }
      },
      {
        path: 'test', component: AllNotificationComponent,
        data: { roles: ['SuperAdmin'] }
      },
      {
        path: 'dashboard', component: NotificationHomeComponent,
        data: { roles: ['SuperAdmin'] }
      }
    ]
  }
];
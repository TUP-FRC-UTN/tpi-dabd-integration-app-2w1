import { Routes } from "@angular/router";
import { NotificationHomeComponent } from "./notification-home/notification-home.component";
import { AllNotificationComponent } from "./components/all-notification/all-notification.component";
import { NotificationComponent } from "./components/notification/notification.component";
import { PostNotificationAdminComponent } from "./components/post-notification-admin/post-notification-admin.component";
import { roleGuard } from "./guard";

export const NOTIFICATION_ROUTES: Routes = [
  { path: "pepito", component: NotificationComponent },
  { path: "admin-post-notification", component: PostNotificationAdminComponent },
  { path: "admin-all-notifications", component: AllNotificationComponent}, //canActivate: [roleGuard], data: ["SuperAdmin", "Gerente"]
{path: 'test', component: AllNotificationComponent},
  { path: 'dashboard', component: NotificationHomeComponent }, // Cambiar por el componente correspondiente
];
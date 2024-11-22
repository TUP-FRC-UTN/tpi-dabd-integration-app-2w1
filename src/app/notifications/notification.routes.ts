import { Routes } from "@angular/router";
import { NotificationHomeComponent } from "./notification-home/notification-home.component";
import { AllNotificationComponent } from "./components/all-notification/all-notification.component";
import { NotificationComponent } from "./components/notification/notification.component";
import { PostNotificationAdminComponent } from "./components/post-notification-admin/post-notification-admin.component";
import { roleGuard } from "./guard";
import { authGuard } from "../users/guards/auth.guard";

export const NOTIFICATION_ROUTES: Routes = [
  {
    path: '',
    canActivateChild: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin'] },
    children: [
      { path: "show", component: NotificationComponent },
      { path: "admin-post-notification", component: PostNotificationAdminComponent },
      { path: "admin-all-notifications", component: AllNotificationComponent},
      { path: 'test', component: AllNotificationComponent },
      { path: 'dashboard', component: NotificationHomeComponent },
    ]
  }
];
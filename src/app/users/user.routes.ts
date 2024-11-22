import { Routes } from "@angular/router";
import { UsersFamiliarGroupComponent } from "./users-components/users/users-familiar-group/users-familiar-group.component";
import { UsersProfileComponent } from "./users-components/users/users-profile/users-profile.component";
import { ListUsersComponent } from "./users-components/users/users-list-users/list-users.component";
import { NewUserComponent } from "./users-components/users/users-new-user/new-user.component";
import { UsersUpdateUserComponent } from "./users-components/users/users-update-user/users-update-user.component";
import { UsersReportComponent } from "./users-components/dashboard/users-report/users-report.component";
import { UsersGraphicHistogramComponent } from "./users-components/dashboard/users-graphic-histogram/users-graphic-histogram.component";
import { authGuard } from "./guards/auth.guard";
import { roleGuard } from "../users/guards/role.guard";

export const USER_ROUTES: Routes = [
  {
    path: '',
    canActivateChild: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin', 'Gerente general', 'Inquilino', 'Propietario', 'Familiar mayor', 'Familiar menor', 'Gerente multas', 'Gerente inventario', 'Gerente finanzas', 'Seguridad', 'Gerente empleados'] },
    children: [
      {
        path: 'profile',
        component: UsersProfileComponent
      },
      {
        path: 'family',
        component: UsersFamiliarGroupComponent,
        data: { roles: ['Propietario', 'Familiar mayor'] }
      },

      {
        path: 'list', component: ListUsersComponent,
        data: { roles: ['Gerente general', 'SuperAdmin'] }
      },
      {
        path: 'add', component: NewUserComponent,
        data: { roles: ['SuperAdmin', 'Gerente general', 'Propietario'] }
      },
      {
        path: 'edit/:id', component: UsersUpdateUserComponent,
        data: { roles: ['SuperAdmin', 'Gerente general', 'Propietario'] }
      },
      {
        path: 'dashboard', component: UsersReportComponent,
        data: { roles: ['SuperAdmin', 'Gerente general'] }
      },
      {
        path: 'dashboard/user-histogram', component: UsersGraphicHistogramComponent,
        data: { roles: ['SuperAdmin', 'Gerente general'] }
      }
    ]
  }
];
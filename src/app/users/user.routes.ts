import { Routes } from "@angular/router";
import { UsersHomeComponent } from "../common/components/users-home/users-home.component";
import { roleGuard } from "../notifications/guard";
import { NotFoundComponent } from "../common/components/not-found/not-found.component";
import { UnauthorizedComponent } from "../common/components/unauthorized/unauthorized.component";
import { authGuard } from "./guards/auth.guard";
import { UsersFamiliarGroupComponent } from "./users-components/users/users-familiar-group/users-familiar-group.component";
import { UsersProfileComponent } from "./users-components/users/users-profile/users-profile.component";
import { LandingPageComponent } from "../common/components/users-landing-page/landing-page.component";
import { LoginComponent } from "../common/components/users-login/login.component";
import { UsersRecoveryPasswordComponent } from "../common/components/users-recovery-password/users-recovery-password.component";
import { ListUsersComponent } from "./users-components/users/users-list-users/list-users.component";
import { NewUserComponent } from "./users-components/users/users-new-user/new-user.component";
import { UsersUpdateUserComponent } from "./users-components/users/users-update-user/users-update-user.component";

export const USER_ROUTES: Routes = [
  {
    path: 'profile',
    component: UsersProfileComponent,
    data: { roles: ['SuperAdmin', 'Gerente', 'Propietario'] }
  },
  {
    path: 'family',
    component: UsersFamiliarGroupComponent,
    data: { roles: ['Propietario', 'Familiar mayor'] }
  },
  { path: 'list', component: ListUsersComponent, data: { roles: ['Gerente', 'SuperAdmin'] } },
  { path: 'add', component: NewUserComponent },
  { path: 'edit/:id', component: UsersUpdateUserComponent },
  { path: 'dashboard', component: UsersHomeComponent } // Cambiar por el componente correspondiente
];
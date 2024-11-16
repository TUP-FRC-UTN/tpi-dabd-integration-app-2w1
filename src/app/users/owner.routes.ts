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
import { UsersListOwnersComponent } from "./users-components/owners/users-list-owners/users-list-owners.component";
import { UsuariosNewOwnerComponent } from "./users-components/owners/users-new-owner/usuarios-new-owner.component";
import { UsersUpdateOwnerComponent } from "./users-components/owners/users-update-owner/users-update-owner.component";

export const OWNER_ROUTES: Routes = [
  { path: 'list', component: UsersListOwnersComponent },
  { path: 'add', component: UsuariosNewOwnerComponent },
  { path: 'edit/:id', component: UsersUpdateOwnerComponent },
  { path: 'dashboard', component: UsersHomeComponent }, // Cambiar por el componente correspondiente
];
import { Routes } from "@angular/router";
import { UserHomeComponent } from "./user-home/user-home.component";
import { AccountAccountConceptComponent } from "./components/accounts/account-account-concept/account-account-concept.component";
import { AccountAccountListComponent } from "./components/accounts/account-account-list/account-account-list.component";
import { HomeComponent } from "./components/commons/home/home.component";
import { NotFoundComponent } from "./components/commons/not-found/not-found.component";
import { FilesFormComponent } from "./components/files/files-form/files-form.component";
import { FilesViewComponent } from "./components/files/files-view/files-view.component";
import { OwnerFilesViewComponent } from "./components/files/owner-files-view/owner-files-view.component";
import { CadastreOwnerPlotListComponent } from "./components/owners-X-plots/cadastre-owner-plot-list/cadastre-owner-plot-list.component";
import { CadastrePlotOwnerListComponent } from "./components/owners-X-plots/cadastre-plot-owner-list/cadastre-plot-owner-list.component";
import { OwnerDetailComponent } from "./components/owners/owner-detail/owner-detail.component";
import { OwnerFormComponent } from "./components/owners/owner-form/owner-form.component";
import { OwnerListComponent } from "./components/owners/owner-list/owner-list.component";
import { CadastrePlotDetailComponent } from "./components/plots/cadastre-plot-detail/cadastre-plot-detail.component";
import { PlotFormComponent } from "./components/plots/plot-form/plot-form.component";
import { PlotsListComponent } from "./components/plots/plots-list/plots-list.component";
import { RolesDetailComponent } from "./components/roles/roles-detail/roles-detail.component";
import { RolesFormComponent } from "./components/roles/roles-form/roles-form.component";
import { RolesListComponent } from "./components/roles/roles-list/roles-list.component";
import { UserUserDetailComponent } from "./components/users/user-user-detail/user-user-detail.component";
import { UserUserFormComponent } from "./components/users/user-user-form/user-user-form.component";
import { UserUserListComponent } from "./components/users/user-user-list/user-user-list.component";
import { UserUserTenantFormComponent } from "./components/users/user-user-tenant-form/user-user-tenant-form.component";

export const USER_ROUTES: Routes = [
    { path: '', component: UserHomeComponent },
    { path: 'home', component: HomeComponent, /* canActivate: [authGuard] */ },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'owner/form', component: OwnerFormComponent, /* canActivate: [authGuard] */ },
    { path: 'owner/form/:id', component: OwnerFormComponent, /* canActivate: [authGuard] */ },
    { path: 'owner/detail/:id', component: OwnerDetailComponent, /* canActivate: [authGuard] */ },
    { path: 'owner/list', component: OwnerListComponent, /* canActivate: [authGuard] */ },
    { path: 'plot/form', component: PlotFormComponent, /* canActivate: [authGuard] */ },
    { path: 'plot/form/:id', component: PlotFormComponent, /* canActivate: [authGuard] */ },
    { path: 'plot/list', component: PlotsListComponent, /* canActivate: [authGuard] */ },
    { path: 'files/form', component: FilesFormComponent, /* canActivate: [authGuard] */ },
    { path: 'files/view', component: FilesViewComponent, /* canActivate: [authGuard] */ },
    { path: 'files/:ownerId/view', component: OwnerFilesViewComponent, /* canActivate: [authGuard] */ },
    { path: 'user/list', component: UserUserListComponent, /* canActivate: [authGuard] */ },
    { path: 'user/form', component: UserUserFormComponent, /* canActivate: [authGuard] */ },
    { path: 'user/form/:id', component: UserUserFormComponent, /* canActivate: [authGuard] */ },
    { path: 'user/detail/:id', component: UserUserDetailComponent, /* canActivate: [authGuard] */ },
    { path: 'roles/list', component: RolesListComponent, /* canActivate: [authGuard] */ },
    { path: 'user/tenant/form', component: UserUserTenantFormComponent, /* canActivate: [authGuard] */ },
    { path: 'roles/form', component: RolesFormComponent, /* canActivate: [authGuard] */ },
    { path: 'roles/form/:roleId', component: RolesFormComponent, /* canActivate: [authGuard] */ },
    { path: 'roles/detail/:roleId', component: RolesDetailComponent, /* canActivate: [authGuard] */ },
    { path: 'owners/plot/:plotId', component: CadastreOwnerPlotListComponent, /* canActivate: [authGuard] */ },
    { path: 'plots/owner/:ownerId', component: CadastrePlotOwnerListComponent, /* canActivate: [authGuard] */ },
    { path: 'plot/detail/:id', component: CadastrePlotDetailComponent, /* canActivate: [authGuard] */ },
    { path: 'account/concept/:accountId', component: AccountAccountConceptComponent, /* canActivate: [authGuard] */ },
    { path: 'account/list', component: AccountAccountListComponent, /* canActivate: [authGuard] */ },
    { path: '**', component: NotFoundComponent, /* canActivate: [authGuard] */ },
];
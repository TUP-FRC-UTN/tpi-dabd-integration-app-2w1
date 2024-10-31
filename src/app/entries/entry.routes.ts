import { Routes } from "@angular/router";
import { EntryHomeComponent } from "./entry-home/entry-home.component";
import { AccessFormComponent } from "./accesses/features/access-form/access-form.component";
import { AccessQueryComponent } from "./accesses/features/access-query/access-query.component";
import { AuthorizedFormComponent } from "./authorization/features/authorized-form/authorized-form.component";
import { AuthorizedRangeFormComponent } from "./authorization/features/authorized-range-form/authorized-range-form.component";
import { ListAuthComponent } from "./authorization/features/list-auth/list-auth.component";
import { QrFormComponent } from "./qr/features/qr-form/qr-form.component";
import { VisitorFormComponent } from "./visitor/features/visitor-form/visitor-form.component";
import { VisitorListComponent } from "./visitor/features/visitor-list/visitor-list.component";

export const ENTRY_ROUTES: Routes = [
    { path: '', component: EntryHomeComponent },
    {
        path: 'visitors',
        component: VisitorListComponent,
      },
      {
        path: 'visitor/add',
        component: VisitorFormComponent,
      },
      {
        path: 'visitor/edit/:id',
        component: VisitorFormComponent,
      },
      {
        path: 'qr',
        component: QrFormComponent,
      },
      {
        path: 'register-range',
        component: AuthorizedRangeFormComponent,
      },
      {
        path: 'access-query',
        component: AccessQueryComponent,
      },
      {
        path: 'new/auth',
        component: AuthorizedFormComponent,
      },
      {
        path: 'auth-list',
        component: ListAuthComponent,
      },
      {
        path: 'access-form',
        component: AccessFormComponent,
      },
      {
        path: '',
        redirectTo: '/visitors',
        pathMatch: 'full',
      },
];
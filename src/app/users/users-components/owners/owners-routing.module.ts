import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersListOwnersComponent } from './users-list-owners/users-list-owners.component';
import { UsuariosNewOwnerComponent } from './users-new-owner/usuarios-new-owner.component';
import { UsersUpdateOwnerComponent } from './users-update-owner/users-update-owner.component';

const routes: Routes = [
  {path: 'list', component: UsersListOwnersComponent},
  {path: 'add', component: UsuariosNewOwnerComponent},
  {path: 'edit/:id', component: UsersUpdateOwnerComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OwnersRoutingModule { }

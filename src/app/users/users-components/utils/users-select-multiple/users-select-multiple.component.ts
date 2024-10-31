import { CommonModule } from '@angular/common';
import { Component,EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../users-servicies/user.service';
import { RolModel } from '../../../users-models/users/Rol';
import { AuthService } from '../../../users-servicies/auth.service';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-users-select-multiple',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './users-select-multiple.component.html',
  styleUrl: './users-select-multiple.component.css',
})
export class UsersSelectMultipleComponent implements OnInit, OnChanges {
  @Output() rolesEmited = new EventEmitter<string[]>();

  private readonly apiService = inject(UserService);
  private readonly authService = inject(AuthService);
  
  constructor(private router : Router){}

  //Guarda los roles que selecciona el usuario
  @Input() rolesSelected: string[] = []!;

  //Listado de roles que puede seleccionar un propietario
  listRolesForOwner: string[] = ['Familiar mayor', "Familiar menor"];
  roles: RolModel[] = [];

  //Muestra el título del select
  title: string = 'Seleccione un rol...';

  //Carga los roles de la API
  ngOnInit(): void {
    this.apiService.getAllRoles().subscribe({
      next: (data) => {        
        if (this.authService.getActualRole() === 'Propietario') {
          this.roles = data.filter((r) =>
            this.listRolesForOwner.includes(r.description)
          );
        } else {
          this.roles = data.filter(
            (r) => !this.listRolesForOwner.includes(r.description) && r.description !== 'Propietario' && r.description !== 'SuperAdmin'
          );
        }
      },
      error: (error) => {
        //Muestra un error si no puede traer los roles
        Swal.fire({
          title: 'Error',
          text: 'Error al cargar los roles',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        this.router.navigate(['/home']);
      },
    });
  }

  //Cuando hay cambios, se actualiza el label del dropdown
  ngOnChanges(changes : any): void {
    this.roles.forEach((r) => {
      if (this.rolesSelected.includes(r.description)) {
        $('#' + r.id).prop('checked', true);
      }
    });
  }

  //Setea el titulo del dropdown
  setTitle() {
    this.title = '';
    if (this.rolesSelected.length > 0) {
      this.rolesSelected.forEach((r) => {
        this.title += r + ', ';
      });
      this.title = this.title.slice(0, -2);
    } else {
      this.title = 'Seleccione un rol...';
    }
  }

  //Agrega un rol a la lista de roles seleccionados
  addRole(role: string) {
    if (!this.rolesSelected.includes(role)) {
      this.rolesSelected.push(role);
      this.setTitle();

      this.rolesEmited.emit(this.rolesSelected);
    }
  }

  updateRoles(roles: string[]) {
    for(let i = 0; i < roles.length; i++){
      this.addRole(roles[i]);
    }
    if(roles.length === 0){
      this.rolesSelected = [];
      this.setTitle();
    }
  }

  isChecked(roleDescription: string): boolean {
    return this.rolesSelected.includes(roleDescription);
  }

  //Quita un rol de la lista de roles
  removeRole(role: string) {
    this.rolesSelected = this.rolesSelected.filter((r) => r !== role);
    this.rolesEmited.emit(this.rolesSelected);
    this.setTitle();
  }

  //Checkea o descheckea un rol
  onCheckboxChange(event: any) {
    //si está chequeado
    const isChecked = event.target.checked;

    //traer el valor
    const value = event.target.value;
    
    //agregar o quitar roles
    if (isChecked) {
      this.addRole(value);
    } 
    else {
      this.removeRole(value);
    }
  }
}

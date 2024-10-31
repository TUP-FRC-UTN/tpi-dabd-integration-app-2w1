import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SideButton } from '../../../users-models/SideButton';
import { UsersSideButtonComponent } from "../users-side-button/users-side-button.component";
import { LoginService } from '../../../users-servicies/login.service';
import { AuthService } from '../../../users-servicies/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, FormsModule, UsersSideButtonComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  //Expande el side
  expand: boolean = false;
  pageTitle : string = "Página Principal"

  constructor(private router: Router) { }
  private readonly authService = inject(AuthService);

  userRoles: string[] =  [];
  
  //Muestra la vista del rol seleccionado
  actualRole : string = "";

  //Lista de botones
  buttonsList: SideButton[] = [];

  //Recupera el nombre completo del usuario
  setName(){
    return this.authService.getUser().name + " " + this.authService.getUser().lastname;
  }

  async ngOnInit (): Promise<void> {    
    this.userRoles = this.authService.getUser().roles!;
    
     //Suscribirse al Observable para detectar cambios en el rol
     if(this.authService.hasActualRole()){
      this.actualRole = this.authService.getUser().roles[0];
      this.authService.saveActualRole(this.actualRole);
     }else{
      this.actualRole = this.authService.getActualRole()!;
     }

    this.buttonsList = [
      {
         //botón grupo familiar
        icon: "bi bi-house",
        title: "Grupo Familiar",
        route: "home/family",
        roles: ["Propietario"]
      },
      {
        icon: "bi-people",
        title: "Usuarios",
        roles: ["SuperAdmin", "Gerente"],
        childButtons: [{

          //botón agregar usuario
          icon: "bi-person-plus-fill",
          title: "Añadir",
          route: "home/users/add",
          roles: ["SuperAdmin", "Gerente"]
        },
        {

          //botón listado
          icon: "bi-person-lines-fill",
          title: "Listado",
          route: "home/users/list",
          roles: ["SuperAdmin", "Gerente"]
        }
        ]
      },
      {
        icon: "bi-houses",
        title: "Lotes",
        roles: ["SuperAdmin", "Gerente"],
        childButtons: [{
          icon: "bi-house-add",
          title: "Añadir",
          route: "home/plots/add",
          roles: ["SuperAdmin", "Gerente"]
        },
        {
          icon: "bi-house-gear-fill",
          title: "Listado",
          route: "home/plots/list",
          roles: ["SuperAdmin", "Gerente"]
        }],

      },
      {
        icon: "bi-key-fill",
        title: "Propietario",
        roles: ["SuperAdmin", "Gerente"],
        childButtons: [
          {
            icon: "bi-key-fill",
            title: "Añadir",
            route: "home/owners/add",
            roles: ["SuperAdmin", "Gerente"]
          },
          {
            icon: "bi-key-fill",
            title: "Lista",
            route: "home/owners/list",
            roles: ["SuperAdmin", "Gerente"]
          }
        ]
      }

    ];
  }

  //Expandir y contraer el sidebar
  changeState() {
    this.expand = !this.expand;
  }

  confirmExit() {
    Swal.fire({
        title: 'Cerrar sesión',
        text: '¿Estás seguro que deseas cerrar la sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Salir',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            this.redirect('login'); 
        }
    });
  }

  //Redirecciona
  redirect(path: string) {
    if(path === '/login'){
      this.authService.logOut();
      this.router.navigate([path]);
    }
    else{
      this.router.navigate([path]);
    }
  }

  //Cambia el titulo del navbar
  setTitle(title : string){
    this.pageTitle = title;
  }

  //Cambia el rol principal
  selectRole(role : string){
    this.authService.saveActualRole(role);
    this.actualRole = this.authService.getActualRole()!;
    this.router.navigate(["home"]);
  }
}
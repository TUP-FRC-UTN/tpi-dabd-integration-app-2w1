import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { UsersSideButtonComponent } from '../users-side-button/users-side-button.component';
import { NavbarNotificationComponent } from '../navbar-notification/navbar-notification.component';
import { SideButton } from '../../models/SideButton';
import { MockUserService } from '../../service/mockUser.service';

@Component({
  selector: 'app-users-navbar',
  standalone: true,
  imports: [UsersSideButtonComponent, NavbarNotificationComponent, RouterOutlet],
  templateUrl: './users-navbar.component.html',
  styleUrl: './users-navbar.component.css'
})
export class UsersNavbarComponent {
  //Expande el side
  expand: boolean = false;
  pageTitle: string = "Página Principal"

  constructor(private router: Router) { }
  // private readonly authService = inject(AuthService);

  // userRoles: string[] =  this.authService.getUser().roles!; 
  userRoles: string[] = ["Admin", "Owner"]

  //Traer con el authService
  actualRole : string = "Admin"
  //Lista de botones
  buttonsList: SideButton[] = [];

  serviceUser= inject(MockUserService)

  // setName(){
  //   return this.authService.getUser().name + " " + this.authService.getUser().lastname;
  // }

  async ngOnInit(): Promise<void> {
    this.serviceUser.setRol('Admin')
    this.buttonsList = [
      // {
      //   icon: "bi-person",
      //   title: "Perfil",
      //   route: "home/profile",
      //   roles: ["SuperAdmin", "Admin", "Security", "Owner", "Spouse", "FamilyOld", "FamilyYoung", "Tenant"] //ver
      // },
   /*    {
        //botón notificaciones
        icon: "bi bi-bell-fill",
        title: "Notificaciones",
        route: "home/notifications",
        roles: ["Owner", "Admin", "SuperAdmin"]
      }, */
      {
        //botón grupo familiar
        icon: "bi bi-house",
        title: "Familia",
        route: "home/family",
        roles: ["Owner"]
      },
      {
        icon: "bi-people",
        title: "Usuarios",
        roles: ["SuperAdmin", "Admin"],
        childButtons: [{

          //botón agregar usuario
          icon: "bi-person-plus-fill",
          title: "Añadir",
          route: "home/users/add",
          roles: ["SuperAdmin", "Admin"]
        },
        {

          //botón listado
          icon: "bi-person-lines-fill",
          title: "Listado",
          route: "home/users/list",
          roles: ["SuperAdmin", "Admin"]
        }
        ]
      },
      {
        icon: "bi-houses",
        title: "Lotes",
        roles: ["SuperAdmin", "Admin"],
        childButtons: [{
          icon: "bi-house-add",
          title: "Añadir",
          route: "home/plots/add",
          roles: ["SuperAdmin", "Admin"]
        },
        {
          icon: "bi-house-gear-fill",
          title: "Listado",
          route: "home/plots/list",
          roles: ["SuperAdmin", "Admin"]
        }],

      },
      {
        icon: "bi-key-fill",
        title: "Propietario",
        roles: ["SuperAdmin", "Admin"],
        childButtons: [
          {
            icon: "bi-key-fill",
            title: "Añadir",
            route: "home/owners/add",
            roles: ["SuperAdmin", "Admin"]
          },
          {
            icon: "bi-key-fill",
            title: "Lista",
            route: "home/owners/list",
            roles: ["SuperAdmin", "Admin"]
          },
          {
            icon: "bi-key-fill",
            title: "Editar",
            route: "home/owners/edit/:id",
            roles: ["SuperAdmin", "Admin"]
          }
        ]
      }

    ];
  }

  //Expandir y contraer el sidebar
  changeState() {
    this.expand = !this.expand;
  }

  redirect(path: string) {
    // if(path === '/login'){
    //   this.authService.logOut();
    //   this.router.navigate([path]);
    // }
    // else{
    //   this.router.navigate([path]);
    // }
    this.router.navigate([path]);
    this.setTitle("Página Principal")
  }

  setTitle(title: string) {
    this.pageTitle = title;
  }

  selectRole(role : string){
    this.actualRole = role;
    this.serviceUser.setRol(role)
  }
}

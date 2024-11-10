import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { UsersSideButtonComponent } from '../users-side-button/users-side-button.component';
import { SideButton } from '../../common-models/SideButton';

@Component({
  selector: 'app-users-navbar',
  standalone: true,
  imports: [UsersSideButtonComponent, RouterOutlet],
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
  actualRole: string = "Admin"
  //Lista de botones
  buttonsList: SideButton[] = [];

  // setName(){
  //   return this.authService.getUser().name + " " + this.authService.getUser().lastname;
  // }

  async ngOnInit(): Promise<void> {
    this.buttonsList = [
      {
        icon: "bi-boxes",
        title: "Inventario",
        roles: ["SuperAdmin", "Admin", "Encargado de inventario"],
        childButtons: [
          {
            icon: "bi-inboxes-fill",
            title: "Listado de productos",
            roles: ["SuperAdmin", "Admin", "Encargado de inventario"],
            route: "home/inventory",

          },
          {
            icon: "bi-arrow-down-up",
            title: "Historial de stock",
            route: "home/modification-stock-list",
            roles: ["SuperAdmin", "Admin", "Encargado de inventario"]
          },
          {
            icon: "bi-arrow-left-right",
            title: "Movimientos de inventario",
            route: "home/warehouse-movements",
            roles: ["SuperAdmin", "Admin", "Encargado de inventario"]
          },
          {
            icon: "bi-truck",
            title: "Proveedores",
            route: "home/suppliers",
            roles: ["SuperAdmin", "Admin", "Encargado de inventario"]
          },
          {

            icon: "bi-tags-fill",
            title: "Cateogorías de productos",
            route: "home/categories-list",
            roles: ["SuperAdmin", "Admin", "Encargado de inventario"]

          },
          {
            icon: "bi-bar-chart-fill",
            title: "Grafico inventario",
            route: "home/inventory/charts",

            roles: ["SuperAdmin", "Admin", "Encargado de inventario"]
          }
        ]
      },
      {
        icon: "bi-person-vcard",
        title: "Empleados",
        roles: ["SuperAdmin", "Admin", "Encargado de empleados"],
        childButtons: [
          {
            icon: "bi-person-lines-fill",
            title: "Listado de empleados",
            route: "home/employee-list",
            roles: ["SuperAdmin", "Admin", "Encargado de empleados"]
          },
          {
            icon: "bi-person-badge-fill",
            title: "Cargos de empleados",
            route: "home/charges",
            roles: ["SuperAdmin", "Admin", "Encargado de empleados"]
          },
          {
            icon: "bi-bar-chart-fill",
            title: "Grafico asistencias",
            route: "home/employee/charts",
            roles: ["SuperAdmin", "Admin", "Encargado de empleados"]
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
  }

  setTitle(title: string) {
    this.pageTitle = title;
  }

  selectRole(role: string) {
    this.actualRole = role;
  }
}
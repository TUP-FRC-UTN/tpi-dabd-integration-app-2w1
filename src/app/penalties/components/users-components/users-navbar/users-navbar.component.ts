import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SideButton } from '../../../models/SideButton'; 
import { UsersSideButtonComponent } from '../users-side-button/users-side-button.component';

@Component({
  selector: 'app-users-navbar',
  standalone: true,
  imports: [ UsersSideButtonComponent, RouterOutlet],
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

  // setName(){
  //   return this.authService.getUser().name + " " + this.authService.getUser().lastname;
  // }

  async ngOnInit(): Promise<void> {
    this.buttonsList = [
      {
        //Denuncias
        icon: "bi-envelope-exclamation",
        title: "Denuncia",
        roles: ["SuperAdmin", "Admin", "SanctionManager", "Owner", "Tenant"],
        childButtons: [{
          //botón nueva denuncia
          icon: "bi-envelope-plus-fill",
          title: "Enviar",
          route: "home/complaints/postComplaint",
          roles: ["SuperAdmin", "Admin", "SanctionManager", "Owner", "Tenant"]
        },
        {
          //botón listado denuncia
          icon: "bi-envelope-paper-fill",
          title: "Listado",
          route: "home/complaints/listComplaint",
          roles: ["SuperAdmin", "Admin", "SanctionManager"]
        }]
      },
      {
        //Sanciones
        icon: "bi-exclamation-triangle",
        title: "Infracciones",
        roles: ["SuperAdmin", "Admin", "SanctionManager", "Owner", "Tenant"],
        childButtons: [{
          //Listado multas y advertencias
          icon: "bi-receipt",
          title: "Listado",
          route: "home/sanctions/sanctionsList",
          roles: ["SuperAdmin", "Admin", "SanctionManager", "Owner", "Tenant"]
        },
        {
          //Listado Informes
          icon: "bi-clipboard2-fill",
          title: "Informes",
          route: "home/sanctions/reportList",
          roles: ["SuperAdmin", "Admin", "SanctionManager"]
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

  selectRole(role : string){
    this.actualRole = role;
  }
}
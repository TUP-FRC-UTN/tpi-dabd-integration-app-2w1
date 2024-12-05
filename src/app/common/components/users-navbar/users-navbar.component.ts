import { Component, inject, OnInit } from '@angular/core';
import { SideButton } from '../../models/SideButton';
import { UsersSideButtonComponent } from '../users-side-button/users-side-button.component';
import { NavbarNotificationComponent } from "../../../notifications/components/navbar-notification/navbar-notification.component";
import { RoutingService } from '../../services/routing.service';
import { AuthService } from '../../../users/users-servicies/auth.service';
import { TutorialService } from '../../services/tutorial.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-users-navbar',
  standalone: true,
  imports: [UsersSideButtonComponent, NavbarNotificationComponent, RouterOutlet],
  templateUrl: './users-navbar.component.html',
  styleUrl: './users-navbar.component.css'
})
export class UsersNavbarComponent implements OnInit {
  private readonly routingService: RoutingService = inject(RoutingService);
  private readonly authService = inject(AuthService);
  private readonly tutorialService = inject(TutorialService);

  pageTitle: string = this.routingService.getTitle();
  username: string = this.authService.getUser().name!;
  userLastname: string = this.authService.getUser().lastname!;

  //Expande el side
  expand: boolean = false;

  //Trae la lista de botones
  sideButtons: SideButton[] = this.routingService.getButtons();

  //Roles del usuario
  userRoles: string[] = [];

  //Rol seleccionado
  actualRole: string = '';
  // actualRole: string = 'SuperAdmin';

  ngOnInit(): void {
    this.pageTitle = this.routingService.getTitle();
    this.userRoles = this.authService.getUser().roles!;
    this.actualRole = this.authService.getActualRole()!;
  }


  //Arranca el tutorial segun la pantalla
  startTutorial() {
    console.log("tutorial");
    this.tutorialService.triggerTutorial();
  }


  //Expandir y contraer el sidebar
  changeState() {
    this.expand = !this.expand;
  }


  //Obtiene el título y la url del hijo y llama al servicio para redirigir y setear el titulo
  changePath(info: any) {
    this.routingService.redirect(info.path, info.title);
    this.routingService.getRedirectObservable().subscribe(title => {
      this.pageTitle = title
    });
  }


  //Redirigir a los dashboards
  redirectDashboard() {
    this.routingService.redirect(this.routingService.getDashboardRoute(), 'Dashboard');
  }


  //Seleccionar un rol
  selectRole(role: string) {
    this.authService.saveActualRole(role);
    this.actualRole = role;
    this.routingService.redirect('/main/home', 'Página principal');

  }


  //Cerrar sesión
  logOut() {
    this.authService.logOut();
    this.routingService.redirect('/home');
  }


  //Comprobar si el rol actual puede acceder a los dashboards
  showDashboard() {
    const rolesPermited = ['SuperAdmin', 'Gerente general', 'Gerente multas', 'Gerente finanzas', 'Gerente inventario', 'Gerente empleados'];
    return rolesPermited.includes(this.actualRole) && this.routingService.getCurrentRoute() !== '/main/home';
  }

}
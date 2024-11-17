import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SideButton } from '../../models/SideButton';
import { UsersSideButtonComponent } from '../users-side-button/users-side-button.component';
import { NavbarNotificationComponent } from "../../../notifications/components/navbar-notification/navbar-notification.component";
import { RoutingService } from '../../services/routing.service';
import { AuthService } from '../../../users/users-servicies/auth.service';

@Component({
  selector: 'app-users-navbar',
  standalone: true,
  imports: [UsersSideButtonComponent, NavbarNotificationComponent],
  templateUrl: './users-navbar.component.html',
  styleUrl: './users-navbar.component.css'
})
export class UsersNavbarComponent implements OnInit {
  private readonly routingService: RoutingService = inject(RoutingService);
  private readonly authService = inject(AuthService);

  pageTitle: string = ''
  username: string = this.authService.getUser().name!;
  userLastname: string = this.authService.getUser().lastname!;
  // username: string = "Jhon";     //Hardcodeado para no levantar el micro para login
  // userLastname: string = "Doe";  //Hardcodeado para no levantar el micro para login

  //Expande el side
  expand: boolean = false;

  //Trae la lista de botones
  sideButtons: SideButton[] = this.routingService.getButtons();

  //Roles del usuario
  userRoles: string[] = [];
  // userRoles: string[] = ["SuperAdmin", "Gerente general"]; //Hardcodeado para no levantar el micro para login

  //Rol seleccionado
  actualRole: string = '';
  // actualRole: string = 'SuperAdmin';

  ngOnInit(): void {
    this.pageTitle = this.routingService.getTitle();
    this.userRoles = this.authService.getUser().roles!;
    this.actualRole = this.authService.getActualRole()!;
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
    this.routingService.redirect('/main/home')
  }

}
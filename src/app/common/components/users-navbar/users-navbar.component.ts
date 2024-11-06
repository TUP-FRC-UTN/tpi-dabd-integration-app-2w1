import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SideButton } from '../../models/SideButton';
import { UsersSideButtonComponent } from '../users-side-button/users-side-button.component';
import { NavbarNotificationComponent } from "../../../notifications/components/navbar-notification/navbar-notification.component";
import { RoutingService } from '../../services/routing.service';

@Component({
  selector: 'app-users-navbar',
  standalone: true,
  imports: [UsersSideButtonComponent, NavbarNotificationComponent],
  templateUrl: './users-navbar.component.html',
  styleUrl: './users-navbar.component.css'
})
export class UsersNavbarComponent implements OnInit {
  private readonly routingService: RoutingService = inject(RoutingService);
  // private readonly authService = inject(AuthService);

  pageTitle: string = ''

  //Expande el side
  expand: boolean = false;

  //Trae la lista de botones
  sideButtons: SideButton[] = this.routingService.getButtonList();

  // userRoles: string[] =  this.authService.getUser().roles!; 
  userRoles: string[] = [
    "SuperAdmin",
    "Gerente general",
    "Propietario",
    "Inquilino",
    "Familiar menor",
    "Familiar mayor",
    "Conyuge",
    "Gerente finanzas",
    "Contador",
    "Seguridad",
    "Gerente inventario",
    "Gerente empleados",
    "Gerente multas"
  ]

  actualRole: string = 'SuperAdmin'

  ngOnInit(): void {
    this.pageTitle = this.routingService.getTitle();
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

  redirectDashboard(){
    this.routingService.redirect(this.routingService.getDashboardRoute(), 'Dashboard');

  }

  selectRole(role: string) {
    this.actualRole = role;
  }

}
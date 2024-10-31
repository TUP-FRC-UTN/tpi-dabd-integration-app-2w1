import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NotificationService } from "../../service/notification.service";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { NotificationComponent } from "../notification/notification.component";
import { PostNotificationAdminComponent } from "../post-notification-admin/post-notification-admin.component";
import { SideButton } from "../../models/SideButton";

@Component({
  selector: "app-navbar-notification",
  standalone: true,
  imports: [
    CommonModule,
    NotificationComponent,
    PostNotificationAdminComponent,
    RouterModule,
  ],
  templateUrl: "./navbar-notification.component.html",
  styleUrl: "./navbar-notification.component.css",
})
export class NavbarNotificationComponent {
  showNotificationsDropdown = false;
  notifications: any = [];
  userId: number = 1;
  //Botones
  @Input() info:string = "";

  //Rol del usuario logeado
  @Input() userRole: string = "";

  //Titulo de la pagina
  @Output() sendTitle = new EventEmitter<string>();

  @Output() actualRole = new EventEmitter<string>();


  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  showNotifications() {
    this.info= "Notificaciones"
    this.router.navigate(["/home/notifications",this.userRole]);
    this.sendTitle.emit(this.info)
    this.actualRole.emit(this.userRole);
    this.toggleNotifications();
  }

  showSendNotificationsAdmin() {
    this.info = "Envio de Notificaciones Generales";
    this.sendTitle.emit(this.info)
    this.router.navigate(["/home/admin-post-notifications"]);
  }

  toggleNotifications(): void {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
  }

  fetchNotifications(): void {
    this.notificationService.getData(this.userId).subscribe((data) => {
      this.notifications = [...data.fines, ...data.access, ...data.payments];
    });
  }

  toggleNotificationsAndFetch(): void {
    this.toggleNotifications();
    this.fetchNotifications();
  }
}

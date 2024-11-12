import { Component, ElementRef, Renderer2, EventEmitter, Output } from "@angular/core";
import { NotificationService } from "../../service/notification.service";
import { CommonModule, DatePipe } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { NotificationComponent } from "../notification/notification.component";
import { AllNotifications } from "../../models/all-notifications";
import { Access } from "../../models/access";
import { Fine } from "../../models/fine";
import { General } from "../../models/general";
import { Inventory } from "../../models/inventory";
import { Payments } from "../../models/payments";
import { Notifications } from "../../models/notifications";

type Notification = Access | Fine | General | Payments;

@Component({
  selector: "app-navbar-notification",
  standalone: true,
  imports: [
    CommonModule,
    NotificationComponent,
    DatePipe,
    RouterModule,
  ],
  templateUrl: "./navbar-notification.component.html",
  styleUrl: "./navbar-notification.component.css",
})
export class NavbarNotificationComponent {
  showNotificationsDropdown = false;
  notifications: Notification[] = [];
  userId: number = 1;
  
  @Output() sendTitle = new EventEmitter<string>();
  private clickListener: () => void;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.clickListener = this.renderer.listen("document", "click", (event) => {
      if (this.showNotificationsDropdown && !this.elementRef.nativeElement.contains(event.target)) {
        this.showNotificationsDropdown = false;
      }
    });
  }

  ngOnInit(): void {
    this.fetchNotifications();
  }

  ngOnDestroy(): void {
    this.clickListener();
  }

  showNotifications(): void {
    this.sendTitle.emit('Notificaciones');
    this.router.navigate(["/main/notifications/pepito"]);
    this.toggleNotifications();
  }

  toggleNotifications(): void {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
  }

  fetchNotifications(): void {
    this.notificationService.getData(this.userId).subscribe({
      next: (data:Notifications) => {
        this.notifications = [
          ...data.fines, 
          ...data.access, 
          ...data.payments, 
          ...data.generals,
        ].sort((a, b) => 
          new Date(b.created_datetime).getTime() - new Date(a.created_datetime).getTime()
        );
      }
    })


  }

  get recentNotifications(): Notification[] {
    const unread = this.notifications.filter(n => !n.markedRead);
    const read = this.notifications.filter(n => n.markedRead);
    
    return [...unread, ...read].slice(0, 4);
  }

  toggleNotificationsAndFetch(): void {
    this.toggleNotifications();
    this.fetchNotifications();
  }

  markAsRead(notification: Notification): void {    
    if (notification.tableName) {
      this.notificationService.putData(notification.id, notification.tableName.toUpperCase()).subscribe({
        next: () => this.fetchNotifications()
      });
    }
  }

  getMessage(notification: Notification): string {
    if ('message' in notification) {
      return notification.message;
    }
    return '';
  }
}
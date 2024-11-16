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
import { Subscription } from "rxjs";

type Notification = Access | Fine | General | Payments;
declare var bootstrap: any;

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
  private modalInstance: any;

  showNotificationsDropdown = false;
  notifications: Notification[] = [];
  userId: number = 1;
  selectedNotification: Notification | null = null;
  subscription = new Subscription()
  
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
    this.initializeModal();
  }

  private initializeModal(): void {
    const modalElement = document.getElementById('modalNotificationBell');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true
      });

      // Agregar listener para limpiar backdrops al cerrar
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.cleanupBackdrops();
      });
    }
  }

  private cleanupBackdrops(): void {
    // Remover todos los backdrops existentes
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
      backdrop.remove();
    });
    // Remover la clase modal-open del body
    document.body.classList.remove('modal-open');
  }

  ngOnDestroy(): void {
    if (this.modalInstance) {
      this.modalInstance.dispose();
      this.subscription.unsubscribe()
  }
    this.cleanupBackdrops();
    this.clickListener();  }

  showNotifications(): void {
    this.sendTitle.emit('Notificaciones');
    this.router.navigate(["/home/notifications"]);
    this.toggleNotifications();
  }

  toggleNotifications(): void {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
  }

  fetchNotifications(): void {
    const getNotifications = this.notificationService.getData(this.userId).subscribe({
      next: (data:Notifications) => {
        this.notifications = [
          ...data.fines, 
          ...data.access, 
          ...data.payments, 
          ...data.generals,
        ].sort((a, b) => 
          new Date(b.created_datetime).getTime() - new Date(a.created_datetime).getTime()
        );
      },
      error: (error) => console.log(error)
    })
    this.subscription.add(getNotifications)
    


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

  selectNotification(notification: Notification): void {
    this.selectedNotification = notification;
    this.markAsRead(notification);
    // Limpiar backdrops existentes antes de abrir el modal
    this.cleanupBackdrops();
    if (this.modalInstance) {
      this.modalInstance.show();
    }  }

  markAsRead(notification: Notification): void {    
    if (notification.tableName) {
      const putNotification = this.notificationService.putData(notification.id, notification.tableName.toUpperCase()).subscribe({
        next: () => this.fetchNotifications(),
        error: (error) => console.log(error)
      });

      this.subscription.add(putNotification)
    }
  }

  getMessage(notification: Notification): string {
    if ('message' in notification) {
      return notification.message;
    }
    return '';
  }
}
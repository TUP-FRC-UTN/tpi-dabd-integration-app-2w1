import {
  Component,
  ElementRef,
  Renderer2,
  EventEmitter,
  Output,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NotificationService } from '../../service/notification.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationComponent } from '../notification/notification.component';
import { AllNotifications } from '../../models/all-notifications';
import { Access } from '../../models/access';
import { Fine } from '../../models/fine';
import { General } from '../../models/general';
import { Inventory } from '../../models/inventory';
import { Payments } from '../../models/payments';
import { Notifications } from '../../models/notifications';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../users/users-servicies/auth.service';

type Notification = Access | Fine | General | Payments | Inventory;
declare var bootstrap: any;

@Component({
  selector: 'app-navbar-notification',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './navbar-notification.component.html',
  styleUrl: './navbar-notification.component.css',
})
export class NavbarNotificationComponent implements OnInit, OnDestroy {
  private modalInstance: any;

  showNotificationsDropdown = false;
  notifications: Notification[] = [];
  userId: number = 0;
  selectedNotification: Notification | null = null;
  subscription = new Subscription();

  @Output() sendTitle = new EventEmitter<string>();
  private clickListener: () => void;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private authservice: AuthService
  ) {
    this.clickListener = this.renderer.listen('document', 'click', (event) => {
      if (
        this.showNotificationsDropdown &&
        !this.elementRef.nativeElement.contains(event.target)
      ) {
        this.showNotificationsDropdown = false;
      }
    });
  }
  lstNotification: Notifications = {
    fines: [],
    access: [],
    payments: [],
    generals: [],
    inventories: [],
  };
  counterNotificationsNoRead = 0;
  NotificationsNoRead() {
    this.counterNotificationsNoRead = 0;
    this.notifications.forEach((a) => {
      if (a.markedRead === false) {
        this.counterNotificationsNoRead += 1;
      }
    });
    console.log(this.counterNotificationsNoRead);
  }

  ngOnInit(): void {
    this.userId = this.authservice.getUser().id;
    this.fetchNotifications();
    this.initializeModal();
  }

  private initializeModal(): void {
    const modalElement = document.getElementById('modalNotificationBell');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true,
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
    backdrops.forEach((backdrop) => {
      backdrop.remove();
    });
    // Remover la clase modal-open del body
    document.body.classList.remove('modal-open');
  }

  ngOnDestroy(): void {
    if (this.modalInstance) {
      this.modalInstance.dispose();
      this.subscription.unsubscribe();
    }
    this.cleanupBackdrops();
    this.clickListener();
  }

  showNotifications(): void {
    this.sendTitle.emit('Notificaciones');
    this.router.navigate(['/main/notifications/show']);
    this.toggleNotifications();
  }

  toggleNotifications(): void {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
  }

  fetchNotifications(): void {
    const getNotifications = this.notificationService
      .getData(this.userId)
      .subscribe({
        next: (data: Notifications) => {
          this.notifications = [
            ...data.fines,
            ...data.access,
            ...data.payments,
            ...data.generals,
            ...data.inventories,
          ].sort(
            (a, b) =>
              new Date(b.created_datetime).getTime() -
              new Date(a.created_datetime).getTime()
          );
          this.NotificationsNoRead();
        },
        error: (error) => console.log(error),
      });
    this.subscription.add(getNotifications);
  }

  get recentNotifications(): Notification[] {
    const unread = this.notifications.filter((n) => !n.markedRead);
    const read = this.notifications.filter((n) => n.markedRead);

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
    }
  }

  markAsRead(notification: Notification): void {
    if (notification.tableName) {
      const putNotification = this.notificationService
        .putData(notification.id, notification.tableName.toUpperCase())
        .subscribe({
          next: () => this.fetchNotifications(),
          error: (error) => console.log(error),
        });

      this.subscription.add(putNotification);
    }
  }

  getMessage(notification: Notification): string {
    if ('message' in notification) {
      return notification.message;
    }
    return '';
  }
}

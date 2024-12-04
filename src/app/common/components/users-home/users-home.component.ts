import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../users/users-servicies/auth.service';
import { UserLoged } from '../../../users/users-models/users/UserLoged';
import { WeatherService } from '../../../users/users-servicies/weather.service';
import { WeatherData } from '../../../users/users-models/weather/WeatherData';
import { CommonModule } from '@angular/common';
import { LandingNotification } from '../../models/Landing-notification';
import { NotificationService } from '../../../notifications/service/notification.service';
import { NotificationsService } from '../../../users/users-servicies/notifications.service';
import { TutorialService } from '../../services/tutorial.service';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';

@Component({
  selector: 'app-users-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-home.component.html',
  styleUrl: './users-home.component.css',
})
export class UsersHomeComponent implements OnInit, OnDestroy {
  constructor(
    private authService: AuthService,
    private weatherService: WeatherService,
    private notificationService: NotificationsService,
    private tutorialService: TutorialService
  ) {
    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        arrow: false,
        modalOverlayOpeningPadding: 10,
        modalOverlayOpeningRadius: 10,
        canClickTarget: false,
      },
      keyboardNavigation: false,

      useModalOverlay: true,
    });
  }

  ngOnDestroy(): void {
    if (this.tour) {
      this.tour.complete();
    }
    this.subsription.unsubscribe();
    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }

  userLoged: UserLoged | undefined;
  greeting: string = '';
  icon: string = '';
  currentTime: string = '';
  userName: string = '';
  weather: WeatherData | null = null;
  forecast: WeatherData[] = [];
  notifications: LandingNotification[] = [];
  tour: Shepherd.Tour;
  tutorialSubscription = new Subscription();
  subsription = new Subscription();

  ngOnInit() {
    this.weatherService.getForecast();
    this.weatherService.getWeather();
    this.loadNotifications();

    const aux = this.weatherService.weather$.subscribe((weather) => {
      this.weather = weather;
    });

    const aux2 = this.weatherService.forecast$.subscribe((forecast) => {
      this.forecast = forecast;
    });
    // Actualizar cada minuto

    // Obtener el nombre del usuario
    this.userLoged = this.authService.getUser();
    this.userName = this.userLoged?.name || '';

    this.subsription.add(aux);
    this.subsription.add(aux2);

    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
  }

  startTutorial() {
    if (this.tour) {
      this.tour.complete();
    }

    this.tour.addStep({
      id: 'table-step',
      title: 'Barra de navegación',
      text: 'Esta es la barra de navegación. Desde aquí puede ingresar a su perfil, ver sus notificaciones, o acceder a la sección de ajustes.',
      attachTo: {
        element: '#navbar',
        on: 'auto',
      },
      buttons: [
  
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'table-step',
      title: 'Barra lateral',
      text: 'Desde acá puede acceder a las demás pantallas del sistema. Pulse en el botón de la izquierda para ver más información.',
      attachTo: {
        element: '#sidebar',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'table-step',
      title: 'Notificaciones',
      text: 'Acá puede ver las últimas tres notificaciones generales. Para ver más, visite la pestaña de notificaciones.',
      attachTo: {
        element: '#notificaciones',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'table-step',
      title: 'Clima',
      text: 'Acá puede ver el clima actual y los pronósticos para los próximos días.',
      attachTo: {
        element: '#clima',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior', action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'table-step',
      title: 'Contactos',
      text: 'Acá puede ver los números de contacto en caso de necesitar comunicarse con nosotros.',
      attachTo: {
        element: '#contactos',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Finalizar',
          action: this.tour.complete,
        },
      ],
    });

    
    
    this.tour.start();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('es-ES', { weekday: 'long' });
    return this.capitalizeFirstLetter(day);
  }

  formatDateToDDMM(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  }

  loadNotifications() {
    // this.notificationService.getAll().subscribe(
    //   notifications => {
    //     notifications.sort((a, b) => new Date(b.created_datetime).getTime() - new Date(a.created_datetime).getTime());
    //     let notis = notifications.filter(n => n.userId === this.userLoged?.id);
    //     this.notifications = notis.slice(0, 3);
    //   },
    //   error => {
    //     console.error('Error al obtener las notificaciones', error);
    //   }
    // );

    //Trae las ultmias notificaciones del usuario
    this.notificationService
      .getAllByUser(this.authService.getUser().id)
      .subscribe({
        next: (notifications: LandingNotification[]) => {
          this.notifications = notifications.slice(0, 3);
        },
        error: (err) => {
          console.error('Error al cargar las notificaciones', err);
        },
      });
  }

  capitalizeFirstLetter(day: string): string {
    return day.charAt(0).toUpperCase() + day.slice(1);
  }
}

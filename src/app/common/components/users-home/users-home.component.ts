import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../users-servicies/auth.service';
import { UserLoged } from '../../../users-models/users/UserLoged';
import { WeatherService } from '../../../users-servicies/weather.service';
import { WeatherData } from '../../../users-models/weather/WeatherData';
import { CommonModule } from '@angular/common';
import { Notification } from '../../../users-models/notifications/Notification';
import { NotificationsService } from '../../../users-servicies/notifications.service';

@Component({
  selector: 'app-users-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-home.component.html',
  styleUrl: './users-home.component.css'
})
export class UsersHomeComponent implements OnInit {
  
  constructor(private authService: AuthService, private weatherService: WeatherService, private notificationService: NotificationsService) { }
  userLoged: UserLoged | undefined;
  greeting: string = '';
  icon: string = '';
  currentTime: string = '';
  userName: string = '';
  weather: WeatherData | null = null;
  forecast: WeatherData[] = [];
  notifications: Notification[] = [];

  ngOnInit() {
    this.weatherService.getForecast();
    this.weatherService.getWeather();
    this.loadNotifications();

      this.weatherService.weather$.subscribe(weather => {
        this.weather = weather;
      });
  
      this.weatherService.forecast$.subscribe(forecast => {
        this.forecast = forecast;
      });
    // Actualizar cada minuto

    // Obtener el nombre del usuario
    this.userLoged= this.authService.getUser();
    this.userName = this.userLoged?.name || '';
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
    this.notificationService.getAll().subscribe(
      notifications => {
        notifications.sort((a, b) => new Date(b.created_datetime).getTime() - new Date(a.created_datetime).getTime());

        this.notifications = notifications.slice(0, 3);
      },
      error => {
        console.error('Error al obtener las notificaciones', error);
      }
    );
  }

  capitalizeFirstLetter(day: string): string {
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

}


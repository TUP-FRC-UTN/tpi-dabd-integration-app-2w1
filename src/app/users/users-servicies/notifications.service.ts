import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Notification } from '../users-models/notifications/Notification';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:8080/general/';
  
  
  getAll(): Observable<Notification[]>{
    return this.http.get<Notification[]>(this.url + 'getNotificationGeneral');
  }
}

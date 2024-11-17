import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LandingNotification } from '../../common/models/Landing-notification';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:8080/general/';
  
  
  getAll(): Observable<LandingNotification[]>{
    return this.http.get<LandingNotification[]>(this.url + 'getNotificationGeneral');
  }
}

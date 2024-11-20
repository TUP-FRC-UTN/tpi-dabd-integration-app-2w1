import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LandingNotification } from '../../common/models/Landing-notification';
import { Observable } from 'rxjs';
import { environment } from '../../common/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private readonly http = inject(HttpClient);
  private readonly url = environment.services.notifications;
  
  
  getAll(): Observable<LandingNotification[]>{
    return this.http.get<LandingNotification[]>(this.url + '/general/getNotificationGeneral');
  }

  getAllByUser(userId: number): Observable<LandingNotification[]>{
    return this.http.get<LandingNotification[]>(this.url + '/getGeneralNotifications/' + userId);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notifications } from '../models/notifications';
import { NotificationGeneral } from '../notificationGeneral';
import { NotificationGeneralDTO } from '../models/DTOs/NotificationGeneralDTO';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private urlApi = 'http://localhost:8080/Notification/';
  private urlPost = 'http://localhost:8080/general/postNotificationGeneral';

  constructor(private http: HttpClient) { }

  public getData(userId:number): Observable<Notifications> {
    return this.http.get<Notifications>(this.urlApi + userId); 
  }

  public postNotification(notification: NotificationGeneralDTO): Observable<NotificationGeneral> {
    return this.http.post<NotificationGeneral>(this.urlPost, notification);
  }

}

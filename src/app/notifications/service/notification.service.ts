import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notifications } from '../models/notifications';
import { NotificationGeneral } from '../notificationGeneral';
import { NotificationGeneralDTO } from '../models/DTOs/NotificationGeneralDTO';
import { AllNotifications } from '../models/all-notifications';
import { NReadDTO } from '../models/DTOs/nread-dto';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private urlApi = 'http://localhost:8080/Notification/';
  private urlPost = 'http://localhost:8080/general/postNotificationGeneral';
  private urlput = 'http://localhost:8080/markNotificationRead'

  constructor(private http: HttpClient) { }

  public getData(userId:number): Observable<Notifications> {
    return this.http.get<Notifications>(this.urlApi + userId); 
  }

  public putData(notiId:number,table:string): Observable<boolean> {
    const dto:NReadDTO ={
      notificationId: notiId,
      table: table
    }

    return this.http.put<boolean>(this.urlput, dto); 
  }

  public postNotification(notification: NotificationGeneralDTO): Observable<NotificationGeneral> {
    return this.http.post<NotificationGeneral>(this.urlPost, notification);
  }

}

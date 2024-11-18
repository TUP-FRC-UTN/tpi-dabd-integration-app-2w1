import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notifications } from '../models/notifications';
import { AllNotifications } from '../models/all-notifications';
import { environment } from '../../common/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationRegisterService {

  private url = environment.services.notifications + "/NotificationsRegister";

  constructor(private http: HttpClient) { }
  
  public getData(): Observable<AllNotifications> {
    return this.http.get<AllNotifications>(this.url);
  }


}

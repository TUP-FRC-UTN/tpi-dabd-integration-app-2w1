import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notifications } from '../models/notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationRegisterService {

  private url = "http://localhost:8080/NotificationsRegister";

  constructor(private http: HttpClient) { }
  
  public getData(): Observable<Notifications> {
    return this.http.get<Notifications>(this.url);
  }
}

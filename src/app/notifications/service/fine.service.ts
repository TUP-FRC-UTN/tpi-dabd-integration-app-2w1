import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fine } from '../models/fine';
import { environment } from '../../common/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FineService {

  private urlApi =environment.services.notifications +  '/fines/getNotifications';

  constructor(private http: HttpClient) { }

  public getData(): Observable<Fine[]> {
    return this.http.get<Fine[]>(this.urlApi);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fine } from '../models/fine';


@Injectable({
  providedIn: 'root'
})
export class FineService {

  private urlApi = 'http://host.docker.internal/fines/getNotifications';

  constructor(private http: HttpClient) { }

  public getData(): Observable<Fine[]> {
    return this.http.get<Fine[]>(this.urlApi);
  }
}

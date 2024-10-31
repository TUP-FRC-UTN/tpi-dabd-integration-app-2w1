import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fine } from '../models/fine';


@Injectable({
  providedIn: 'root'
})
export class FineService {

  private urlApi = 'http://localhost:8080/fines/getNotifications';

  constructor(private http: HttpClient) { }

  public getData(): Observable<Fine[]> {
    return this.http.get<Fine[]>(this.urlApi);
  }
}

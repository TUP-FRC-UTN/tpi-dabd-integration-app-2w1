import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProviderViewOwnerService {
  private apiUrl = 'https://670ad56dac6860a6c2caa382.mockapi.io/users';

  constructor(private http: HttpClient) {}

  getProviders(): Observable<{ id: string | number, nombre: string }[]> {
    return this.http.get<{ id: string | number, nombre: string }[]>(this.apiUrl);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChargeResponse } from '../models/charge-response';
import { ChargeRequest } from '../models/charge-request';

@Injectable({
  providedIn: 'root'
})
export class ChargeService {
  
  private readonly EMPLOYEE_BASE_URL: string = 'http://localhost:8080/';
  private readonly CHARGES_URL: string = `${this.EMPLOYEE_BASE_URL}charges`;
  

  constructor(private http: HttpClient) { }

  createCargo(cargoData: ChargeRequest): Observable<ChargeResponse> {
    return this.http.post<ChargeResponse>(`${this.CHARGES_URL}`, cargoData);
  }

  updateCargo(id: number, cargoData: ChargeRequest): Observable<ChargeResponse> {
    return this.http.put<ChargeResponse>(`${this.CHARGES_URL}/${id}`, cargoData);
  }

  getCargo(id: number): Observable<ChargeResponse> {
    return this.http.get<ChargeResponse>(`${this.CHARGES_URL}/${id}`);
  }

  getAllCargos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.CHARGES_URL}/active`);
  }

  updateStatus(id: number): Observable<ChargeResponse> {
    return this.http.put<ChargeResponse>(`${this.CHARGES_URL}/status/${id}`, null);
  }
}

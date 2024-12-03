import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../common/environments/environment';
import { GetUserDto } from '../expense-generation-interfaces/expense-generation-user';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.services.usersAndAddresses;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene usuarios con rol "Co-Owner" para un lote específico
   * @param plotId - ID del lote
   * @returns Observable con la lista de usuarios
   */
  getUsersByPlotIdAndSecondaryRole(plotId: number): Observable<GetUserDto[]> {
    return this.http.get<GetUserDto[]>(`${this.apiUrl}/get/secondary/${plotId}`);
  }

  /**
   * Obtiene el propietario principal a partir de un co-propietario
   * @param userId - ID del usuario co-propietario
   * @returns Observable con el usuario propietario
   */
  getOwnerBySecondaryOwner(userId: number): Observable<GetUserDto> {
    return this.http.get<GetUserDto>(`${this.apiUrl}/get/owner/${userId}/secondary`);
  }
}
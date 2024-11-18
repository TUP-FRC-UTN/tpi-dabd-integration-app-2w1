import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import Swal from 'sweetalert2';
import { Movement } from '../../../../models/access-report/Types';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ENDPOINTS, environmentEntries } from '../../../../entries-environment';

@Injectable({
  providedIn: 'root'
})
export class MovementsService {

  private readonly API_URL = API_ENDPOINTS.MOVEMENTS;

  constructor(private http: HttpClient) {}

  getMovementsByDateRange(startDate: Date, endDate: Date): Observable<{ data: Movement[] }> {

    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    const params = new HttpParams()
      .set('startDate', this.formatDateTime(startDateTime))
      .set('endDate', this.formatDateTime(endDateTime));

    return this.http.get<{ data: Movement[] }>(`${this.API_URL}/ByMonth`, { params })
      .pipe(
        catchError(error => {
          console.error('Error en la petición:', error);
          this.showErrorMessage();
          return of({ data: [] });
        })
      );
  }

  private formatDateTime(date: Date): string {
    return `${date.getFullYear()}-${
      String(date.getMonth() + 1).padStart(2, '0')}-${
      String(date.getDate()).padStart(2, '0')}T${
      String(date.getHours()).padStart(2, '0')}:${
      String(date.getMinutes()).padStart(2, '0')}:${
      String(date.getSeconds()).padStart(2, '0')}`;
  }

  private showErrorMessage(): void {
    Swal.fire({
      icon: 'error',
      title: '¡Error!',
      text: 'Ocurrió un error al intentar cargar los datos. Por favor, intente nuevamente.',
    });
  }

}

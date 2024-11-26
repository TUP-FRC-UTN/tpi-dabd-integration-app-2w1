import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {  RequestWakeUpCallDTO,  RequestWakeUpCallGroupDTO,  ResponseWakeUpCallDTO,  EmployeeGetResponseDTO,} from '../Models/llamado-atencion';
import { MovementRecord } from '../Models/llamado-atencion';
import { environment } from '../../../common/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LlamadoAtencionService {
  // Base URLs
  private readonly BASE_URL: string = environment.services.employees + "/";

  // Wake Up Calls endpoints
  private readonly WAKE_UP_CALLS_URL: string = `${this.BASE_URL}wakeUpCalls`;
  private readonly WAKE_UP_CALLS_CREATE: string = `${this.WAKE_UP_CALLS_URL}/crear`;
  private readonly WAKE_UP_CALLS_CREATE_GROUP: string = `${this.WAKE_UP_CALLS_URL}/crear/grupo`;

  // Employees endpoints
  private readonly EMPLOYEES_URL: string = `${this.BASE_URL}employees`;
  private readonly EMPLOYEES_GET_ALL: string = `${this.EMPLOYEES_URL}/allEmployees`;

  constructor(private http: HttpClient) {}

  crearWakeUpCall(request: RequestWakeUpCallDTO): Observable<ResponseWakeUpCallDTO> {
    return this.http.post<ResponseWakeUpCallDTO>(this.WAKE_UP_CALLS_CREATE, request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  crearWakeUpCallGrupo(request: RequestWakeUpCallGroupDTO): Observable<ResponseWakeUpCallDTO[]> {
    return this.http.post<ResponseWakeUpCallDTO[]>(this.WAKE_UP_CALLS_CREATE_GROUP, request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }


  getAllEmployees(): Observable<EmployeeGetResponseDTO[]> {
    return this.http.get<EmployeeGetResponseDTO[]>(this.EMPLOYEES_GET_ALL)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error;
    }
    console.error('Error en LlamadoAtencionService:', errorMessage);
    return throwError(errorMessage);
  }
}

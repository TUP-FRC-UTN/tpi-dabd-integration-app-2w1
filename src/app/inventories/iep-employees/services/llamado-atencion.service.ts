import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {  RequestWakeUpCallDTO,  RequestWakeUpCallGroupDTO,  ResponseWakeUpCallDTO,  EmployeeGetResponseDTO,} from '../Models/llamado-atencion';
import { MovementRecord } from '../Models/llamado-atencion';

@Injectable({
  providedIn: 'root',
})
export class LlamadoAtencionService {
  // Base URLs
  private readonly BASE_URL: string = 'http://localhost:8080/';
  private readonly MOCK_API_URL: string = 'https://mocki.io/v1/';

  // Wake Up Calls endpoints
  private readonly WAKE_UP_CALLS_URL: string = `${this.BASE_URL}wakeUpCalls`;
  private readonly WAKE_UP_CALLS_CREATE: string = `${this.WAKE_UP_CALLS_URL}/crear`;
  private readonly WAKE_UP_CALLS_CREATE_GROUP: string = `${this.WAKE_UP_CALLS_URL}/crear/grupo`;

  // Employees endpoints
  private readonly EMPLOYEES_URL: string = `${this.BASE_URL}employees`;
  private readonly EMPLOYEES_GET_ALL: string = `${this.EMPLOYEES_URL}/allEmployees`;

  // Movements endpoints
  private readonly MOVEMENTS_MOCK: string = `${this.MOCK_API_URL}dc644c6b-deab-431a-83d9-3d232a1dff05`;

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

  getMovements(date: string): Observable<string[]> {
    return this.http.get<MovementRecord[]>(this.MOVEMENTS_MOCK).pipe(
      map(movements => {
        const selectedDate = date.split('T')[0];
        const filteredMovements = movements.filter(movement =>
          movement.movementDatetime.startsWith(selectedDate)
        );

        const employeeMovements = new Map<string, string[]>();
        filteredMovements.forEach(movement => {
          const employeeTypes = employeeMovements.get(movement.document) || [];
          employeeTypes.push(movement.movementType);
          employeeMovements.set(movement.document, employeeTypes);
        });

        return Array.from(employeeMovements.entries())
          .filter(([_, types]) =>
            types.includes('ENTRADA') && types.includes('SALIDA')
          )
          .map(([document]) => document);
      })
    );
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

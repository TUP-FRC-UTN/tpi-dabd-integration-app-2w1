import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, BehaviorSubject, tap } from 'rxjs';
import {
  Employee,
  EmployeePerformance,
  Performance,
  WakeUpCallDetail,
} from '../models/listado-desempeño';

@Injectable({
  providedIn: 'root',
})
export class ListadoDesempeñoService {
  private readonly EMPLOYEE_BASE_URL: string = 'http://localhost:8080/';
  private readonly EMPLOYEE_URL_ALL: string = `${this.EMPLOYEE_BASE_URL}employees/allEmployees`;
  private readonly WAKE_UP_CALLS_URL_TODAS: string = `${this.EMPLOYEE_BASE_URL}wakeUpCalls/todas`;
  private readonly WAKE_UP_CALLS_URL_ALL: string = `${this.EMPLOYEE_BASE_URL}wakeUpCalls/AllWakeUpCalls`;

  private performancesSubject = new BehaviorSubject<EmployeePerformance[]>([]);
  performances$ = this.performancesSubject.asObservable();

  constructor(private http: HttpClient) { }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.EMPLOYEE_URL_ALL);
  }

  getPerformances(): Observable<Performance[]> {
    return this.http.get<Performance[]>(this.WAKE_UP_CALLS_URL_TODAS);
  }

  getWakeUpCallDetails(): Observable<WakeUpCallDetail[]> {
    return this.http.get<WakeUpCallDetail[]>(this.WAKE_UP_CALLS_URL_ALL);
  }

  getCombinedData(): Observable<EmployeePerformance[]> {
    return forkJoin({
      employees: this.getEmployees(),
      performances: this.getPerformances(),
    }).pipe(
      map(({ employees, performances }) => {
        return performances.map((performance) => ({
          id: performance.employeeId,
          fullName:
            employees.find((emp) => emp.id === performance.employeeId)
              ?.fullName || 'Unknown',
          year: performance.year,
          month: performance.month,
          totalObservations: performance.totalWakeUpCalls,
          performanceType: performance.performanceType,
        }));
      }),
      tap((data) => this.performancesSubject.next(data))
    );
  }

  refreshData(): void {
    console.log('Refrescando datos de desempeño...');
    this.getCombinedData().subscribe();
  }
}

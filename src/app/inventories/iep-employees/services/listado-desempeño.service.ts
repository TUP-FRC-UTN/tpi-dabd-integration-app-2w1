import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, BehaviorSubject, tap } from 'rxjs';
import {
  Employee,
  EmployeePerformance,
  Performance,
  WakeUpCallDetail,
} from '../Models/listado-desempeño';

@Injectable({
  providedIn: 'root',
})
export class ListadoDesempeñoService {
  // Base URL
  private readonly BASE_URL: string = 'http://localhost:8080/';

  // Employees endpoints
  private readonly EMPLOYEES_URL: string = `${this.BASE_URL}employees`;
  private readonly EMPLOYEES_GET_ALL: string = `${this.EMPLOYEES_URL}/allEmployees`;

  // Wake Up Calls endpoints
  private readonly WAKE_UP_CALLS_URL: string = `${this.BASE_URL}wakeUpCalls`;
  private readonly WAKE_UP_CALLS_GET_ALL: string = `${this.WAKE_UP_CALLS_URL}/todas`;
  private readonly WAKE_UP_CALLS_DETAILS: string = `${this.WAKE_UP_CALLS_URL}/AllWakeUpCalls`;

  // Subject para manejar el estado de los datos
  private performancesSubject = new BehaviorSubject<EmployeePerformance[]>([]);
  performances$ = this.performancesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.EMPLOYEES_GET_ALL);
  }

  getPerformances(): Observable<Performance[]> {
    return this.http.get<Performance[]>(this.WAKE_UP_CALLS_GET_ALL);
  }

  getWakeUpCallDetails(): Observable<WakeUpCallDetail[]> {
    return this.http.get<WakeUpCallDetail[]>(this.WAKE_UP_CALLS_DETAILS);
  }
  

  getCombinedData(): Observable<EmployeePerformance[]> {
    return forkJoin({
      employees: this.getEmployees(),
      performances: this.getPerformances()
    }).pipe(
      map(({ employees, performances }) => {
        return performances.map(performance => {
          const employee = employees.find(emp => emp.id === performance.employeeId);
          return {
            id: performance.employeeId,
            fullName: employee ? employee.fullName : 'Unknown',
            year: performance.year,
            month: performance.month,
            totalObservations: performance.totalWakeUpCalls,
            performanceType: performance.performanceType
          };
        });
      }),
      tap(data => this.performancesSubject.next(data))
    );
  }

  refreshData(): void {
    console.log('Refrescando datos de desempeño...');
    this.getCombinedData().subscribe();
  }
}

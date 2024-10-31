import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EmpListadoEmpleados, Employee } from '../models/emp-listado-empleados';
import { EmpListadoAsistencias } from '../models/emp-listado-asistencias';
import { EmpPutEmployees } from '../models/emp-put-employees';

@Injectable({
  providedIn: 'root',
})
export class EmpListadoEmpleadosService {
  private readonly EMPLOYEE_BASE_URL = 'http://localhost:8080'; // URL base del servidor
  private _refresh$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  // Getter para acceder al Subject de refresh
  get refresh$(): Observable<void> {
    return this._refresh$;
  }

  // Método para obtener los empleados.
  getEmployees(): Observable<EmpListadoEmpleados[]> {
    return this.http.get<EmpListadoEmpleados[]>(
      `${this.EMPLOYEE_BASE_URL}/employees/allActiveEmployees`
    );
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(
      `${this.EMPLOYEE_BASE_URL}/employees/employeeById?id=${id}`
    );
  }
  getEmployeeById2(id: number): Observable<EmpPutEmployees> {
    return this.http.get<EmpPutEmployees>(
      `${this.EMPLOYEE_BASE_URL}/employees/employeeById?id=${id}`
    );
  }

  getAttendances(): Observable<EmpListadoAsistencias[]> {
    return this.http.get<EmpListadoAsistencias[]>(
      `${this.EMPLOYEE_BASE_URL}/attendances/get`
    );
  }

  changeEmployeeStatus(id: number): Observable<void> {
    return this.http.put<void>(
      `${this.EMPLOYEE_BASE_URL}/employees/updateActiveEmployee/${id}`,
      {}
    );
  }

  putAttendances(id: number, state: string): Observable<any> {
    // Inicializa nuevos parámetros en cada ejecución
    let params = new HttpParams()
        .set('id', id.toString())
        .set('state', state);

    console.log("Id: " + id + " State: " + state);
    
    return this.http.put(`${this.EMPLOYEE_BASE_URL}/attendances/putState`, null, { params });
  }

}
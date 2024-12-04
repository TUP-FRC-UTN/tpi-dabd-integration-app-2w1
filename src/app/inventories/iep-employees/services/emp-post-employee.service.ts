import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Provincia } from '../Models/emp-provincia';
import { Charge, DocumentTypeEnum, PostEmployeeDto } from '../Models/emp-post-employee-dto';
import { EmpPutEmployees } from '../Models/emp-put-employees';
import { environment } from '../../../common/environments/environment';
import { EmpPutEmployeeRequest } from '../Models/EmpPutEmployeeRequest';

@Injectable({
  providedIn: 'root',
})
export class EmpPostEmployeeService {
  private readonly EMPLOYEE_BASE_URL: string = environment.services.employees + "/";
  private readonly INVENTORY_URL: string = environment.services.inventory + "/";

  private SUPPLIER_URL: string = `${this.INVENTORY_URL}suppliers`;

  private readonly CHARGES_URL: string = `${this.EMPLOYEE_BASE_URL}charges/active`;
  private readonly EMPLOYEE_URL: string = `${this.EMPLOYEE_BASE_URL}employees`;
  private readonly EMPLOYEE_POST_URL: string = `${this.EMPLOYEE_URL}/post`;

  private baseUrlProvinces: string = `${this.EMPLOYEE_BASE_URL}/employees/datos`

  constructor(private client: HttpClient) { }

  private _refresh$ = new Subject<void>();

  get refresh$(): Observable<void> {
    return this._refresh$;
  }
  // getProviders():Observable<any[]>{
  //   return this.client.get<any[]>(this.baseUrl).pipe(delay(2000));
  // }

  getProviders(): Observable<any[]> {
    return this.client.get<any[]>(this.SUPPLIER_URL);
  }

  getProvinces(): Observable<Provincia[]> {
    return this.client.get<Provincia[]>(this.baseUrlProvinces);
  }

  getCharges(): Observable<Charge[]> {
    return this.client.get<Charge[]>(this.CHARGES_URL);
  }

  validateDni(dni:string,documentType:DocumentTypeEnum):Observable<boolean>{
    const params = new HttpParams()
    .set('documentType', documentType)
    .set('dni', dni);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Cambia esto según tus necesidades
      'Accept': 'application/json', // Aceptar respuesta en formato JSON
      // Puedes añadir más encabezados aquí si es necesario
  });
  // Realiza la petición GET
  return this.client.get<boolean>(`${this.EMPLOYEE_URL}/validate/dni`, { params});

  }
  validateCuil(cuil:string):Observable<boolean>{

    const params = new HttpParams()
    .set('cuil', cuil);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Cambia esto según tus necesidades
      'Accept': 'application/json', // Aceptar respuesta en formato JSON
      // Puedes añadir más encabezados aquí si es necesario
  });
  // Realiza la petición GET
  return this.client.get<boolean>(`${this.EMPLOYEE_URL}/validate/cuil`, { params}); }

  

  createProduct(dto: PostEmployeeDto): Observable<any> {
    const url = `${this.EMPLOYEE_POST_URL}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const json = JSON.stringify(dto);

    console.log(json);

    return this.client.post<any>(url, json, { headers });
  }

  updateEmployee(dto: EmpPutEmployeeRequest): Observable<any> {
    const url = `${this.EMPLOYEE_URL}/put/${dto.id}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const json = JSON.stringify(dto);

    return this.client.put<any>(url, json, { headers });
  }
}

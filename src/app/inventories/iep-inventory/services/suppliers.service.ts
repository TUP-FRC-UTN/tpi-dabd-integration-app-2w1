import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Supplier } from '../models/suppliers';

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  
  private readonly INVENTORY_BASE_URL: string = 'http://localhost:8081/';
  private readonly ACCESSES_URL: string = 'http://localhost:8090/PostNewSupplier';

  private readonly SUPPLIERS_URL: string = `${this.INVENTORY_BASE_URL}suppliers`;
  private readonly SUPPLIERS_URL_GET_BY_ID: string = `${this.SUPPLIERS_URL}/getbyId/`;
  private readonly SUPPLIERS_URL_BAJA_LOGICA: string = `${this.SUPPLIERS_URL}/bajalogica`;

  createSupplier(formData: any) {
    return this.http.post(this.SUPPLIERS_URL, formData);
  }

  createSupplierAccess(formData: any){
    return this.http.post(this.ACCESSES_URL, formData, { responseType: 'text' });
  }

  searchSuppliers(
    name: string | null,
    supplierType: string | null,
    createdDatetime: string | null,
    authorized: boolean
  ): Observable<Supplier[]> {
    let params = new HttpParams();

    if (authorized) {
      params = params.set('authorized', authorized.toString());
    }
    if (name) {
      params = params.set('name', name);
    }

    if (supplierType) {
      params = params.set('supplierType', supplierType);
    }

    if (createdDatetime) {
      params = params.set('dateOfJoining', createdDatetime);
    }

    return this.http.get<Supplier[]>(this.SUPPLIERS_URL, {
      params,
    });
  }

  // En suppliers.service.ts
  searchSuppliers2(name: string | null, types: string[] | null, date: any, autorized: boolean) {
    let params = new HttpParams();

    if (name) params = params.append('name', name);
    if (types && types.length > 0) {
      types.forEach(type => {
        params = params.append('types', type);
      });
    }
    if (date) params = params.append('date', date);
    params = params.append('autorized', autorized.toString());

    return this.http.get<Supplier[]>(`${this.INVENTORY_BASE_URL}/suppliers/search`, { params });
  }

  getSupplierById(id: number): Observable<any> {
    return this.http.get<any>(this.SUPPLIERS_URL_GET_BY_ID + id);
  }

  updateSupplier(supplierUpdate: Supplier): Observable<any> {
    return this.http.put<any>(this.SUPPLIERS_URL, supplierUpdate);
  }

  deleteSupplier(id: number): Observable<any> {
    return this.http.put<any>(`${this.SUPPLIERS_URL_BAJA_LOGICA}/${id}`, {});
  }

  getAll(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.SUPPLIERS_URL + '/all');
  }

  getSupplierByCuit(cuit:string):Observable<boolean>{
    return this.http.get<boolean>(this.SUPPLIERS_URL+'/getByCuit/'+cuit);
  }
  getSupplierByEmail(email:string):Observable<boolean>{
    return this.http.get<boolean>(this.SUPPLIERS_URL+'/getByEmail/'+email);
  }
  getSupplierByName(name:string):Observable<boolean>{
    return this.http.get<boolean>(this.SUPPLIERS_URL+'/getByName/'+name);
  }

  constructor(private http: HttpClient) { }
}

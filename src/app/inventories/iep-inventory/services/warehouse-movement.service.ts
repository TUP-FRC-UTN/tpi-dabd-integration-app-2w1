import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetWarehouseMovementRequest } from '../models/GetWarehouseMovementRequest';
import { WarehouseMovement } from '../models/getWarehouseMovementResponse';
import { Observable } from 'rxjs';
import { IepCreateWarehouseMovementDTO } from '../models/iep-create-warehouse-movement-dto';
import { WarehouseMovementByProduct } from '../models/WarehouseMovementByProduct';
@Injectable({
  providedIn: 'root',
})
export class WarehouseMovementService {
  private readonly INVENTORY_BASE_URL: string = 'http://localhost:8081/';
  private readonly WAREHOUSE_MOVEMENT_URL: string = `${this.INVENTORY_BASE_URL}warehouseMovement`;
  private readonly WAREHOUSE_MOVEMENT_URL_SEARCH: string = `${this.WAREHOUSE_MOVEMENT_URL}/search`;
  constructor(private http: HttpClient) { }
  public getWarehouseMovements(): Observable<WarehouseMovementByProduct[]> {
    return this.http.get<WarehouseMovementByProduct[]>(`${this.WAREHOUSE_MOVEMENT_URL}/all`);
  }
  public searchMovements(
    searchParams: GetWarehouseMovementRequest
  ): Observable<WarehouseMovement[]> {
    let params = new HttpParams();
    if (searchParams.createdDate) {
      params = params.append('createdDate', searchParams.createdDate);
    }
    if (searchParams.applicantOrResponsible) {
      params = params.append(
        'applicantOrResponsible',
        searchParams.applicantOrResponsible
      );
    }
    if (searchParams.productId) {
      params = params.append('productId', searchParams.productId);
    }
    if (searchParams.movementType) {
      params = params.append('movementType', searchParams.movementType);
    }
    if (searchParams.detailCount) {
      params = params.append('detailCount', searchParams.detailCount);
    }
    return this.http.get<WarehouseMovement[]>(
      this.WAREHOUSE_MOVEMENT_URL_SEARCH,
      { params }
    );
  }
  public postWarehouseMovement(
    dto: IepCreateWarehouseMovementDTO,
    idUser: number
  ): Observable<any> {
    const url = this.WAREHOUSE_MOVEMENT_URL;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('idUser', idUser.toString());
    const json = JSON.stringify(dto);
    console.log(json);
    return this.http.post<any>(url, json, { headers, params });
  }
}
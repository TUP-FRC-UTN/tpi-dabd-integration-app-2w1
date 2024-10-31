import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {

  private readonly INVENTORY_BASE_URL: string = 'http://localhost:8081/';

  private readonly ESTADO_URL: string = `${this.INVENTORY_BASE_URL}detailProductState/getAll`;  

  constructor(private client: HttpClient) { }

  getEstados():Observable<String[]> {
    return this.client.get<String[]>(`${this.ESTADO_URL}`);
  }
}

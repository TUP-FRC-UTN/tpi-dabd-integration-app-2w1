import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../common/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {

  private readonly INVENTORY_BASE_URL: string = environment.services.inventory + "/";

  private readonly ESTADO_URL: string = `${this.INVENTORY_BASE_URL}detailProductState/getAll`;  

  constructor(private client: HttpClient) { }

  getEstados():Observable<String[]> {
    return this.client.get<String[]>(`${this.ESTADO_URL}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';
import { environment } from '../../../common/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ProvidersService {

  private readonly INVENTORY_BASE_URL: string = environment.services.inventory + "/";
  private readonly SUPPLIERS_URL: string = `${this.INVENTORY_BASE_URL}suppliers`;  

  constructor(private client:HttpClient) { }

  // getProviders():Observable<any[]>{
  //   return this.client.get<any[]>(this.baseUrl).pipe(delay(2000));
  // }

  getProviders():Observable<any[]>{
    return this.client.get<any[]>(this.SUPPLIERS_URL);
  }

}

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map, Observable } from 'rxjs';
import { movementDto } from '../models/movementDto';
import { environment } from '../../../common/environments/environment.prod';


@Injectable({
  providedIn: 'root',
})


export class IncreaseDecrementService {

  constructor(private http: HttpClient,) { }
  private readonly INVENTORY_BASE_URL: string = environment.services.inventory + "/";
  private readonly AMOUNT_MODIFICATION_URL: string = `${this.INVENTORY_BASE_URL}amountModification`;

  

  createMovement( param : movementDto,id:number):Observable<movementDto>{
    console.group("EL ID ESSSSS:" +id)
      return this.http.post<movementDto>(this.AMOUNT_MODIFICATION_URL+"?idUser="+id,param)
  }
}

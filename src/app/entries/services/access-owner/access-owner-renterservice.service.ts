import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { AccessNewMovementsEntryDtoOwner, AccessUserAllowedInfoDtoOwner } from '../../models/access-visitors/interface/access-owner';

@Injectable({
  providedIn: 'root'
})
export class AccessOwnerRenterserviceService {
  private BASE_URL = "http://localhost:8090";
  private URL_POST_OwnerRenterInList = "http://localhost:8090/movements_entry/register";
  private URL_GET_UserAllowedVisitors = `${this.BASE_URL}/user_Allowed/ownersAndTenants/`;
  private URL_POST_OwnerExit="http://localhost:8090/movements_exit/registerOwnerExit"
  private httpClient:HttpClient=inject(HttpClient)
  constructor(){}
  registerOwnerRenterEntry(movement:AccessNewMovementsEntryDtoOwner): Observable<any>{
    const headers=new HttpHeaders({'Content-Type': 'application/json'});
    return this.httpClient.post<any>(this.URL_POST_OwnerRenterInList, movement, {headers})
  }
  getAllOwnerRenterList():Observable<AccessUserAllowedInfoDtoOwner[]>{
    return this.httpClient.get<AccessUserAllowedInfoDtoOwner[]>(`${this.URL_GET_UserAllowedVisitors}`);
  }
  registerExitOwner(movement:AccessNewMovementsEntryDtoOwner): Observable<any>{
    const headers=new HttpHeaders({'Content-Type': 'application/json'});
    return this.httpClient.post<any>(this.URL_POST_OwnerExit, movement, {headers})
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Owner } from '../../../models/expenses-models/owner';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class OwnerService {

  //private apiUrl = 'https://67056d45031fd46a830fec8e.mockapi.io/G7/propietario'; 
  private apiUrl = 'https://my-json-server.typicode.com/EbeltramoUtn/demoTP/owners'; 

  constructor(private http: HttpClient) {}

  // getOwners(): Observable<Owner[]> {
  //   return this.http.get<Owner[]>(this.apiUrl);
  // }
  getOwners(): Observable<Owner[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((owners: any[]) => 
        owners.map(owner => ({
          id: owner.owner_id,  // Mapea el campo owner_id a id
          name: owner.name,  // Deja el nombre igual
          lastname: owner.last_name  // Mapea last_name a lastname
        }))
      )
    );
  }
}

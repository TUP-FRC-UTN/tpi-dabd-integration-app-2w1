import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Owner } from '../../models/owner';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../common/environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class OwnerService {

  //private apiUrl = 'https://67056d45031fd46a830fec8e.mockapi.io/G7/propietario'; 
   private ownersApiUrl: string= environment.services.ownersAndPlots;
  constructor(private http: HttpClient) {
  }

  getOwners(): Observable<Owner[]> {
     const url = `${this.ownersApiUrl}/owners`
    return this.http.get<any[]>(url).pipe(
      map((owners: any[]) => 
        owners.map(owner => ({
          id: owner.id,  
          name: owner.name,  
          lastname: owner.lastname, 
          fullName:owner.name+' '+owner.lastname+' '+ owner.dni 
        }))
      )
    );
  }
}

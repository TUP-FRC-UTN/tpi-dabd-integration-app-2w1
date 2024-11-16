import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map} from 'rxjs';
import { Owner } from '../expense-generation-interfaces/expense-generation-owner';
import { GetOwnerAndPlot } from '../expense-generation-interfaces/expense-generation-getownerandplot';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {
  private baseUrl = 'http://host.docker.internal:9062/owners';

  constructor(private http: HttpClient) {}

  getOwnerByUserId(userId: number): Observable<Owner | null> {
    return this.http.get<GetOwnerAndPlot[]>(`${this.baseUrl}/ownersandplots`)
      .pipe(
        map(ownersAndPlots => {
          // Buscar el propietario que corresponde al usuario logueado
          const ownerAndPlot = ownersAndPlots.find(o => o.user?.id === userId);
          return ownerAndPlot ? ownerAndPlot.owner : null;
        })
      );
  }
}
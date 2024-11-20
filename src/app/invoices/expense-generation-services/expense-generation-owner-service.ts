import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map} from 'rxjs';
import { Owner } from '../expense-generation-interfaces/expense-generation-owner';
import { GetOwnerAndPlot } from '../expense-generation-interfaces/expense-generation-getownerandplot';
import { environment } from '../../common/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {


  constructor(private http: HttpClient) {}

  getOwnerByUserId(userId: number): Observable<Owner | null> {
    return this.http.get<GetOwnerAndPlot[]>(environment.services.ownersAndPlots + `/owners/ownersandplots`)
      .pipe(
        map(ownersAndPlots => {
          // Buscar el propietario que corresponde al usuario logueado
          const ownerAndPlot = ownersAndPlots.find(o => o.user?.id === userId);
          return ownerAndPlot ? ownerAndPlot.owner : null;
        })
      );
  }
}
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessInsurancesService {

  constructor() { }

  getAll() : Observable<string[]> {
    return of([
      'San Cristobal',
      'La Nueva',
      'La Segunda',
      'Sancor Seguros',
      'Federación Patronal',
      'Mapfre',
      'Provincia Seguros',
      'Allianz',
      'Zurich Seguros',
      'Nación Seguros',
      'Securitas',
      'Mercantil Andina',
      'Quálitas'
    ]);
  }
}
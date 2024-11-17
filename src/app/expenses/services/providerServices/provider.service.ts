import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Provider } from '../../models/provider';
import { Injectable } from '@angular/core';
import { environment } from '../../../common/environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class ProviderService {


  private suppliersUrl: string=environment.services.inventory;
  constructor(private http: HttpClient) {
  }

  getProviders(): Observable<Provider[]> {
    return this.http.get<Provider[]>(this.suppliersUrl+'/suppliers').pipe(
      map((providers: any[]) => providers.map(provider => ({
        ...provider, 
        id: provider['id'], 
        description: provider['name'] || provider['description'] || 'Sin descripción' 
      })))
    );
  }

}

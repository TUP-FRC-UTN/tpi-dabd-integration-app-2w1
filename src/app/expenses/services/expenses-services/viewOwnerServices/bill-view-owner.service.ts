import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { BillViewOwner } from '../../../models/expenses-models/bill-view-owner.model';
import { ProviderViewOwnerService } from './provider-view-owner.service';

@Injectable({
  providedIn: 'root'
})
export class BillViewOwnerService {
  private apiUrl = 'http://localhost:8080/api/expenses/distributions/getAllByOwnerId';

  constructor(
    private http: HttpClient,
    private providerService: ProviderViewOwnerService
  ) {}

  getBillsWithProviders(ownerId: number, startDate: string, endDate: string): Observable<BillViewOwner[]> {
    const urlWithFilters = `${this.apiUrl}?id=${ownerId}&startDate=${startDate}&endDate=${endDate}`;
    return forkJoin({
      bills: this.http.get<BillViewOwner[]>(urlWithFilters),
      providers: this.providerService.getProviders()
    }).pipe(
      map(({ bills, providers }) => {
        const providerMap = providers.reduce((map, provider) => {
          map[provider.id] = provider.nombre || 'Proveedor Anónimo';
          return map;
        }, {} as { [key: string]: string });

        return bills.map(bill => ({
          ...bill,
          providerName: providerMap[bill.providerId] || 'Proveedor Anónimo'
        }));
      })
    );
  }
}

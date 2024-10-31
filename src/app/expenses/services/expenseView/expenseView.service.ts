import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ExpenseView } from '../../models/expenseView';
import { DistributionList } from '../../models/distributionList';
import { Instalmentlist } from '../../models/installmentList';
import { HttpClient } from '@angular/common/http';
@Injectable({
    providedIn: 'root',
  })
  export class ExpenseViewService{
    private apiUrl = 'http://localhost:8080/expenses/getById?expenseId=';
    constructor(private http: HttpClient){

    }
    getById(id: number): Observable<ExpenseView> {
        return this.http.get<any>(`${this.apiUrl}${id}`).pipe(
          map((data: any) => ({
            id: data.id,
            description: data.description,
            providerId: 0, 
            providerName: data.provider,
            expenseDate: data.expenseDate,
            invoiceNumber: data.invoiceNumber,
            typeExpense: data.expenseType,
            categoryId: 0, 
            categoryName: data.category,
            fileId: data.fileId,
            amount: data.amount,
            installments: data.installmentList?.length || 0,
            distributions: [],
            distributionList: data.distributionList?.map((dist: any) => ({
              ownerId: dist.ownerId,
              owenerFullName: dist.ownerFullName,
              amount: dist.amount,
              proportion: dist.proportion
            } as DistributionList)) || [],
            installmentList: data.installmentList?.map((inst: any) => ({
              paymentDate: new Date(inst.paymentDate),
              installmentNumber: inst.installmentNumber,
            } as Instalmentlist)) || [],
          } as ExpenseView))
        );
      }
  }
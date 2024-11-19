import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ExpenseView } from '../../models/expenseView';
import { DistributionList } from '../../models/distributionList';
import { Instalmentlist } from '../../models/installmentList';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../common/environments/environment.prod';
@Injectable({
    providedIn: 'root',
  })
  export class ExpenseViewService{
    private apiUrl = environment.services.expensesManager+'/expenses/getById?expenseId=';
    constructor(private http: HttpClient){

    }
    getById(id: number): Observable<ExpenseView> {
      return this.http.get<any>(`${this.apiUrl}${id}`).pipe(
        map((data: any) => {
          const transformedDistributionList = data.distributionList?.map((dist: any) => ({
            ownerId: dist.ownerId,
            owenerFullName: dist.ownerFullName,
            amount: parseFloat(dist.amount.toFixed(4)), 
            proportion: parseFloat(dist.proportion.toFixed(2)), 
          } as DistributionList)) || [];
          const transformedInstallmentList = data.installmentList?.map((inst: any) => ({
            paymentDate: new Date(inst.paymentDate),
            installmentNumber: inst.installmentNumber,
          } as Instalmentlist)) || [];
          console.log("Transformed Distribution List:", transformedDistributionList);
          console.log("Transformed Installment List:", transformedInstallmentList);
    
          return {
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
            amount: parseFloat(data.amount), 
            installments: data.installmentList?.length || 0,
            distributions: [], 
            distributionList: transformedDistributionList,
            installmentList: transformedInstallmentList,
          } as ExpenseView;
        })
      );
    }
  }
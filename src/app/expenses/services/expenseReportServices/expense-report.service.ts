import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpenseData } from '../../models/ExpenseData';
import { CategoryData } from '../../models/CategoryData';
import { kpiExpense } from '../../models/kpiExpense';
import { LastBillRecord } from '../../models/LastBillRecord';
import { environment } from '../../../common/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class ExpenseReportService {
  private apiUrl = environment.services.expensesManager;

  constructor(private http: HttpClient) {}

  getExpenseData(yearFrom: number, yearTo: number): Observable<ExpenseData[]> {
    const url = `${this.apiUrl}/reportchart/yearmonth?start_year=${yearFrom}&end_year=${yearTo}`;
    return this.http.get<ExpenseData[]>(url);
  }

  getCategoryData(startDate: string, endDate: string): Observable<CategoryData[]> {
    const url = `${this.apiUrl}/reportchart/categoriesperiod?start_date=${startDate}&end_date=${endDate}`;
    return this.http.get<CategoryData[]>(url);
  }
  
  getKpiData(startDate: string, endDate: string): Observable<kpiExpense[]> {
    const url = `${this.apiUrl}/reportchart/expenseByTypeAndCategory?start_date=${startDate}&end_date=${endDate}`;
    return this.http.get<kpiExpense[]>(url);
  }

  getLastBillRecord():Observable<LastBillRecord>{
    const url = `${this.apiUrl}/reportchart/lastBillRecord`;
    return this.http.get<LastBillRecord>(url);
  }
}
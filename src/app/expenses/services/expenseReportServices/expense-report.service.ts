import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpenseData } from '../../models/expenseReportModel/ExpenseData';
import { CategoryData } from '../../models/expenseReportModel/CategoryData';

@Injectable({
  providedIn: 'root',
})
export class ExpenseReportService {
  private apiUrl = 'http://localhost:8080/reportchart/yearmonth';
  private categoryUrl = 'http://localhost:8080/reportchart/categoriesperiod';

  constructor(private http: HttpClient) {}

  getExpenseData(startDate: string, endDate: string): Observable<ExpenseData[]> {
    const url = `${this.apiUrl}?start_date=${startDate}&end_date=${endDate}`;
    return this.http.get<ExpenseData[]>(url);
  }

  getCategoryData(startDate: string, endDate: string): Observable<CategoryData[]> {
    const url = `${this.categoryUrl}?start_date=${startDate}&end_date=${endDate}`;
    return this.http.get<CategoryData[]>(url);
  }
}
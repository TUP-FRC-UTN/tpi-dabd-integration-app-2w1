import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bill } from '../../../models/expenses-models/bill';

@Injectable({
  providedIn: 'root'
})
export class BillService {
 
  
  private apiUrl = 'http://localhost:8080/expenses/getByFilters';

  constructor(private http: HttpClient) {}

 
  deleteLogicBill(id: number): Observable<void> {
    const url = 'http://localhost:8080/expenses?id='+id;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<void>(url, { headers });
  }
  createNoteOfCredit(failedBillId: number | null) {
    const url = 'http://localhost:8080/expenses/note_credit?id='+failedBillId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<void>(url, { headers });
  }
  getBillsByDateRange(formattedDateFrom: string, formattedDateTo: string) :Observable<Bill[]> {
    const urlWithFilters = `${this.apiUrl}?dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}`;
    console.log(urlWithFilters)
    return this.http.get<Bill[]>(urlWithFilters);
  }
  
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bill } from "../../models/bill"
import { UserService } from '../userServices/user.service';
import { environment } from '../../../common/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class BillService {
 
  
  private apiUrl = environment.services.expensesManager;

  constructor(private http: HttpClient,private userService :UserService) {}

 
  deleteLogicBill(id: number): Observable<void> {
    const url = `${this.apiUrl}/expenses?id=${id}&userId=${this.userService.getUserId()}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<void>(url, { headers });
  }
  createNoteOfCredit(failedBillId: number | null): Observable<void> {
    if (failedBillId === null) {
      throw new Error('El ID de la factura fallida no puede ser null.');
    }
    const url = `${this.apiUrl}/expenses/note_credit?id=${failedBillId}&userId=${this.userService.getUserId()}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<void>(url, { headers });
  }
  getBillsByDateRange(formattedDateFrom: string, formattedDateTo: string) :Observable<Bill[]> {
    const urlWithFilters = `${this.apiUrl}?dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}`;
    console.log(urlWithFilters)
    const response =  this.http.get<Bill[]>(urlWithFilters);
    return response
  }
  
}

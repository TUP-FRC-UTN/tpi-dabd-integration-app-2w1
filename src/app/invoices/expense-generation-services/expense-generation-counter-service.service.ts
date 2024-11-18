import { Injectable } from '@angular/core';
import { ExpenseGenerationCounter } from '../expense-generation-interfaces/expense-generation-accountant';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { environment } from '../../common/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ExpenseGenerationCounterServiceService {
    

  constructor(private readonly http: HttpClient) {}

  getTransactions(): Observable<ExpenseGenerationCounter[]> {
    return this.http.get<ExpenseGenerationCounter[]>(environment.services.expenseGeneration + `/api/expenses/dashboard`).pipe(
      tap(response => console.log('Respuesta API:', response)),
      catchError((error: Error) => {
        console.error('Error al obtener transacciones:', error);
        return throwError(() => error);
      })
    );
  }
}

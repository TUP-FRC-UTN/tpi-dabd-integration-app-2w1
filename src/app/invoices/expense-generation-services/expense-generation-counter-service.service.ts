import { Injectable } from '@angular/core';
import { ExpenseGenerationCounter } from '../expense-generation-interfaces/expense-generation-accountant';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ExpenseGenerationCounterServiceService {
  
  private readonly API_URL: string = 'https://apimocha.com/expenses-managment/counter';
 

  constructor(private readonly http: HttpClient) {}

  getTransactions(): Observable<ExpenseGenerationCounter[]> {
    return this.http.get<ExpenseGenerationCounter[]>(this.API_URL).pipe(
      tap(response => console.log('Respuesta API:', response)),
      catchError((error: Error) => {
        console.error('Error al obtener transacciones:', error);
        return throwError(() => error);
      })
    );
  }
}

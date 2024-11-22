import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, mergeMap, Observable, throwError } from 'rxjs';
import { ExpenseGenerationExpenseInterface } from '../expense-generation-interfaces/expense-generation-expense-interface';
import { Owner } from '../expense-generation-interfaces/expense-generation-owner';
import { ExpenseUpdateDTO } from '../expense-generation-interfaces/expense-generation-update.interface';
import { ExpensePaymentUpdateDTO } from '../expense-generation-interfaces/expense-generation-payment-interface';
import { environment } from '../../common/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ExpenseGenerationExpenseService {



  private ApiBaseUrl = environment.services.expenseGeneration + "/api/expenses/";
  private urlOwnerId =  environment.services.expenseGeneration + "/api/v1/owners/"
  constructor(private http: HttpClient) { }

  getAllExpenses(ownerId: number): Observable<ExpenseGenerationExpenseInterface[]> {
    return this.http.get<ExpenseGenerationExpenseInterface[]>(`${this.ApiBaseUrl}all?owner_id=${ownerId}`).pipe(
      catchError(this.handleError)
    );
  }
  GetOwnerById(id: number): Observable<Owner> {
    if (id === undefined || id === null) {
        console.error('ID no válido para GetOwnerById:', id);
        return throwError(() => 'ID de owner es inválido');
    }
    const url = `${this.urlOwnerId}${id}`;
    return this.http.get<Owner>(url).pipe(
        catchError(this.handleError)
    );
  }
  getAllOwnersWithExpenses(): Observable<{ owner: Owner; expenses: ExpenseGenerationExpenseInterface[] }[]> {
    return this.getAllOwners().pipe(
      map(owners => owners.filter(owner => owner.active)),
      mergeMap(owners => {
        const ownerExpensesRequests = owners.map(owner =>
          this.getAllExpenses(owner.id).pipe(
            map(expenses => ({
              owner: owner,
              expenses: expenses
            })),
            catchError(error => {
              console.error(`Error fetching expenses for owner ${owner.id}:`, error);
              return [{ owner: owner, expenses: [] }];
            })
          )
        );
        return forkJoin(ownerExpensesRequests);
      }),
      catchError(error => {
        console.error('Error in getAllOwnersWithExpenses:', error);
        return throwError(() => error);
      })
    );
  }
  private handleError(error: HttpErrorResponse) {
  let errorMessage = 'Ocurrió un error desconocido';

  // Simplificar el manejo de errores
  if (error.status === 0) {
    errorMessage = 'Error de conexión con el servidor';
  } else {
    errorMessage = error.error?.message || error.message || 'Error en el servidor';
  }

  console.error('Error en la petición:', errorMessage);
  return throwError(() => errorMessage);
  }

  selectedExpenses: ExpenseGenerationExpenseInterface[] = []

  addSelectedExpense(expense: ExpenseGenerationExpenseInterface){
    this.selectedExpenses.push(expense)
  }

  clearSelectedExpenses() {
    this.selectedExpenses = [];
  }

  getSelectedExpenses() {
    return this.selectedExpenses;
  }

  getAllOwners(): Observable<Owner[]> {
    return this.http.get<Owner[]>(environment.services.expenseGeneration + "/api/v1/owners/active").pipe(
      catchError(this.handleError)
    );
  }

  removeSelectedExpense(id: number){
    return  this.selectedExpenses = this.selectedExpenses.filter(expense => expense.id !== id)
  }

updateStatus(expensePaymentUpdateDTOs: ExpensePaymentUpdateDTO[]): Observable<any> {
  const headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    // Agregamos el header requerido con una observación por defecto
    .set('X-Update-Observation', 'Actualización de estado por pago con Stripe');
  
  // Asegurarnos de que enviamos el array en el formato correcto
  const payload = expensePaymentUpdateDTOs;
  
  return this.http.put<any>(
    `${this.ApiBaseUrl}update/status`, 
    payload,
    { headers }
  ).pipe(
    catchError(error => {
      console.error('Request payload:', payload);
      return throwError(() => error);
    })
  );
}


updateExpense(expenseData: ExpenseUpdateDTO, observation: string): Observable<any> {
  const headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('X-Update-Observation', observation);

  return this.http.put(environment.services.expenseGeneration + '/api/expenses/update', expenseData, { headers })
    .pipe(
      catchError(this.handleError)
    );
}

getMultipliers(): Observable<{ latePayment: number; expiration: number }> {
  const latePaymentUrl = environment.services.expenseGeneration + `/api/expenses/late-payment-multiplier`;
  const expirationUrl = environment.services.expenseGeneration +`/api/expenses/expiration-multiplier`;

  return forkJoin({
    latePayment: this.http.get<number>(latePaymentUrl),
    expiration: this.http.get<number>(expirationUrl)
  }).pipe(
    catchError(this.handleError)
  );
}

getGenerationDay(): Observable<number> {
  return this.http.get<number>(environment.services.expenseGeneration + `/api/expenses/generation-day`).pipe(
    catchError(this.handleError)
  );
}



generateAllExpenses(startDate: string, endDate: string): Observable<any> {
  return this.http.post(
    `${environment.services.expenseGeneration}/api/expenses/create/all?startDate=${startDate}&endDate=${endDate}`,
    {} 
  );}

updateLatePaymentMultiplier(multiplier: number, observation: string): Observable<any> {
  const url = environment.services.expenseGeneration + `/api/expenses/late-payment-multiplier`;
  return this.http.put(url, JSON.stringify(multiplier), {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Update-Observation': observation
    })
  }).pipe(
    catchError(this.handleError)
  );
}

updateExpirationMultiplier(multiplier: number, observation: string): Observable<any> {
  const url = environment.services.expenseGeneration + `/api/expenses/expiration-multiplier`;
  return this.http.put(url, JSON.stringify(multiplier), {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Update-Observation': observation
    })
  }).pipe(
    catchError(this.handleError)
  );
}

updateGenerationDay(day: number, observation: string): Observable<any> {
  const url = environment.services.expenseGeneration + `/api/expenses/generation-day`;
  return this.http.put(url, JSON.stringify(day), {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Update-Observation': observation
    })
  }).pipe(
    catchError(this.handleError)
  );
}


}

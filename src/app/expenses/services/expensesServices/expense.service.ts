import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Expense } from '../../models/expense';
import { HttpClient, HttpHeaders, HttpRequest,HttpResponse  } from '@angular/common/http';
import { ExpenseGetById } from '../../models/expenseGetById';
import { UserService } from '../userServices/user.service';
import { environment } from '../../../common/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  
  
  private apiUrl = environment.services.expensesManager+'/expenses'; // URL del endopoint

  constructor(private http: HttpClient, private userService :UserService) {

  }
  registerExpense(expense: Expense, file?: File): Observable<HttpResponse<any>> {
    const formData = new FormData();
    let expenseSave = {
      id: expense.id,
      description: expense.description,
      providerId: expense.providerId,
      expenseDate: expense.expenseDate,
      invoiceNumber: expense.invoiceNumber,
      typeExpense: expense.typeExpense,
      categoryId: expense.categoryId,
      amount: expense.amount,
      fileId: expense.fileId,
      installments: expense.installments,
      distributions: expense.distributions.map(dist => ({ ...dist }))
  };
    expenseSave.distributions.forEach(d => {
      d.proportion=d.proportion/100
    });
    formData.append('expense', JSON.stringify(expenseSave));
  
    if (file) {
      formData.append('file', file);
    }
    formData.append('userId', this.userService.getUserId().toString());
  
    const req = new HttpRequest('POST', this.apiUrl, formData, {
      reportProgress: true,
      headers: new HttpHeaders({
        'accept': 'application/json'
      })
    });
   console.log(req)
    return this.http.request(req).pipe(
      filter(event => event instanceof HttpResponse), 
      map(event => event as HttpResponse<any>) 
    );
  }
  updateExpense(expense: Expense, file?: File): Observable<HttpResponse<any>> {
    const formData = new FormData();
    let expenseSave = {
      id: expense.id,
      description: expense.description,
      providerId: expense.providerId,
      expenseDate: expense.expenseDate,
      invoiceNumber: expense.invoiceNumber,
      typeExpense: expense.typeExpense,
      categoryId: expense.categoryId,
      amount: expense.amount,
      fileId: expense.fileId,
      installments: expense.installments,
      distributions: expense.distributions.map(dist => ({ ...dist }))
  };
    expenseSave.distributions.forEach(d => {
      d.proportion=d.proportion/100
    });
    formData.append('userId', this.userService.getUserId().toString());
    // Asegurarse de que el expense se envía como una cadena JSON
    formData.append('expense', JSON.stringify(expenseSave));

    if (file) {
      formData.append('file', file);
    }

    // Crear la petición manualmente
    const req = new HttpRequest('PUT', this.apiUrl, formData, {
      reportProgress: true,
      headers: new HttpHeaders({
        'accept': 'application/json'
    
      })
    });

  return this.http.request(req).pipe(
    filter(event => event instanceof HttpResponse), // Filtrar para solo la respuesta final
    map(event => event as HttpResponse<any>) // Mapear a HttpResponse
  );
  }

  // Método para obtener todas las expensas
  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl);
  }
  getById(id: number): Observable<ExpenseGetById> {
    return this.http.get<ExpenseGetById>(`${this.apiUrl}/getById?expenseId=${id}`);
  }
 

}

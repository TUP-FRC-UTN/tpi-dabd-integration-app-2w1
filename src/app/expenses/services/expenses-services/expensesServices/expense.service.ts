import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Expense } from '../../../models/expenses-models/expense';
import { HttpClient, HttpHeaders, HttpRequest,HttpResponse  } from '@angular/common/http';
import { ExpenseGetById } from '../../../models/expenses-models/expenseGetById';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  
  
  private apiUrl = 'http://localhost:8080/expenses'; // URL del endopoint

  constructor(private http: HttpClient) {}

  registerExpense(expense: Expense, file?: File): Observable<HttpResponse<any>> {
    const formData = new FormData();
    
    // Asegurarse de que el expense se envía como una cadena JSON
    formData.append('expense', JSON.stringify(expense));

    if (file) {
      formData.append('file', file);
    }

    // Crear la petición manualmente
    const req = new HttpRequest('POST', this.apiUrl, formData, {
      reportProgress: true,
      headers: new HttpHeaders({
        'accept': 'application/json'
    
      })
    });

    // // Loguear los detalles de la petición
    // console.log('Detalles de la petición HTTP:');
    // console.log('Método:', req.method);
    // console.log('URL:', req.url);
    // console.log('Headers:', req.headers.keys().map(key => `${key}: ${req.headers.get(key)}`));
    // console.log('Body (FormData):');
    // formData.forEach((value, key) => {
    //   console.log(`  ${key}:`, value);
    // });

    // Enviar la petición
    //return this.http.request(req);
    // Enviar la petición y filtrar solo cuando la respuesta esté completada
  return this.http.request(req).pipe(
    filter(event => event instanceof HttpResponse), // Filtrar para solo la respuesta final
    map(event => event as HttpResponse<any>) // Mapear a HttpResponse
  );
  }
  updateExpense(expense: Expense, file?: File): Observable<HttpResponse<any>> {
    const formData = new FormData();
    
    // Asegurarse de que el expense se envía como una cadena JSON
    formData.append('expense', JSON.stringify(expense));

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

    // // Loguear los detalles de la petición
    // console.log('Detalles de la petición HTTP:');
    // console.log('Método:', req.method);
    // console.log('URL:', req.url);
    // console.log('Headers:', req.headers.keys().map(key => `${key}: ${req.headers.get(key)}`));
    // console.log('Body (FormData):');
    // formData.forEach((value, key) => {
    //   console.log(`  ${key}:`, value);
    // });

    // Enviar la petición
    //return this.http.request(req);
    // Enviar la petición y filtrar solo cuando la respuesta esté completada
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

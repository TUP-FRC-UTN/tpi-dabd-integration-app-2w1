import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { create } from 'domain';
import { catchError, map, Observable, of, throwError } from 'rxjs';

declare var MercadoPago: any;
@Injectable({
  providedIn: 'root'
})
export class ExpenseGenerationPaymentService {
  
  constructor(private http: HttpClient) { }
  
  
  private readonly StripeURL = "http://localhost:8020";
  

  createPaymentIntent(requestBody: { amount: number; currency: string; cardHolderName: string; dni: string; }): Observable<{ clientSecret: string; paymentIntentId: string }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post<{ clientSecret: string; paymentIntentId: string }>(
      `${this.StripeURL}/create-payment-intent`,
      requestBody,
      { headers }
    ).pipe(
      catchError(error => {
        console.error("Error en la creación del PaymentIntent:", error);
        return of({ clientSecret: '', paymentIntentId: '' }); // Valor por defecto en caso de error
      })
    );
  }
  
  
  //---------------------------------------------Mercado Pago----------------------------------------------

private readonly MercadoPagoIntento = "https://large-dove-unbiased.ngrok-free.app/api/payments/mp"
private readonly MercadoPagoURL = 'http://localhost:8022/api';

createPaymentRequest(paymentData: any): Observable<string> {
  return this.http.post(this.MercadoPagoIntento, paymentData, { responseType: 'text' }).pipe(
    map(response => {
      try {
        const jsonResponse = JSON.parse(response);
        if (jsonResponse && jsonResponse.preferenceId) {
          return jsonResponse.preferenceId;
        } else {
          throw new Error('La respuesta del servidor no contiene un preferenceId válido');
        }
      } catch (error) {
        return response.trim();
      }
    }),
    catchError(this.handleError)
  );
}


checkPaymentStatus(paymentId: string): Observable<any> {
  return this.http.get(`${this.MercadoPagoIntento}/payment-status/${paymentId}`);
}

initMercadoPago(): void {
  const script = document.createElement('script');
  script.src = "https://sdk.mercadopago.com/js/v2";
  script.onload = () => {
    new MercadoPago('APP_USR-d68ed33a-56aa-45be-ba50-bbe017333a6d', {
      locale: 'es-AR'
    });
  };
  document.body.appendChild(script);
}

private handleError(error: HttpErrorResponse) {
  let errorMessage = 'Ocurrió un error desconocido';
  if (error.error instanceof ErrorEvent) {
    errorMessage = `Error: ${error.error.message}`;
  } else {
    errorMessage = `Código de error ${error.status}, ` +
      `mensaje: ${error.error.message || error.message}`;
  }
  console.error(errorMessage);
  return throwError(() => new Error(errorMessage));
}






// updateExpenseStatus(expenseId: number, status: string, paymentDate: string | null): Observable<any> {
//   return this.http.put(`${this.ApiBaseUrl}${expenseId}/status`, { status }).pipe(
//     catchError(this.handleError)
//   );
// }





}
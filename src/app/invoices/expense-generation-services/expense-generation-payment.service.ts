import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../common/environments/environment';

declare var MercadoPago: any;
@Injectable({
  providedIn: 'root'
})
export class ExpenseGenerationPaymentService {

  constructor(private http: HttpClient) { }


  private readonly StripeURL = environment.services.stripeService;


  createPaymentIntent(requestBody: { amount: number; currency: string; cardHolderName: string; dni: string; }): Observable<{ clientSecret: string; paymentIntentId: string }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<{ clientSecret: string; paymentIntentId: string }>(
      `${this.StripeURL}/create-payment-intent`,
      requestBody,
      { headers }
    ).pipe(
      catchError(error => {
        console.error("Error en la creación del PaymentIntent:", error);
        return of({ clientSecret: '', paymentIntentId: '' }); 
      })
    );
  }

  confirmPayment(paymentIntentId: string): Observable<any> {
    return this.http.post( environment.services.stripeService + `/confirm-payment/${paymentIntentId}`, {}).pipe(
      catchError(error => {
        console.error("Error confirmando el pago:", error);
        throw error;
      })
    );
  }

  //---------------------------------------------Mercado Pago----------------------------------------------

private readonly MercadoPagoURL = "https://large-dove-unbiased.ngrok-free.app/api/payments/mp"

createPaymentRequest(paymentData: any): Observable<string> {
  return this.http.post(this.MercadoPagoURL, paymentData, { responseType: 'text' }).pipe(
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

}

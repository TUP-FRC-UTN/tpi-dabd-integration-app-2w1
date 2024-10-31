import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseGenerationExpenseInterface } from '../expense-generation-interfaces/expense-generation-expense-interface';
import { ExpenseGenerationExpenseService } from '../expense-generation-services/expense-generation-expense.service';
import { ExpenseGenerationPaymentService } from '../expense-generation-services/expense-generation-payment.service';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from "@angular/common";
import { loadStripe } from '@stripe/stripe-js';
import { buffer } from 'stream/consumers';

declare var Swal: any;


@Component({
  selector: 'app-expense-generation-payment-form',
  standalone: true,
  imports: [ReactiveFormsModule,
    NgClass,
    DatePipe,
    CurrencyPipe,
    NgFor,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault],
  templateUrl: './expense-generation-payment-form.component.html',
  styleUrl: './expense-generation-payment-form.component.css'
})
export class ExpenseGenerationPaymentFormComponent implements OnInit {

  @Output() status = new EventEmitter<number>();
  @Input() paymentMethod: number = 0;


  paymentForm: FormGroup;
  total: number = 0;
  stripe: Stripe | null = null;
  cardElement: StripeCardElement | null = null;

  expensesToPay: ExpenseGenerationExpenseInterface[] = [];
  paymentIntentId: string = "";
  clientSecret: string = "";
  error: string = '';
  paymentStatusMessage: string = '';
  processing: boolean = false;
  paymentSuccessful: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    public expenseService: ExpenseGenerationExpenseService,
    public checkout: ExpenseGenerationPaymentService
  ) {
    this.paymentForm = this.formBuilder.group({
      cardHolderName: ['', Validators.required],
      dni: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.expensesToPay = this.expenseService.getSelectedExpenses();
    this.total = this.expensesToPay.reduce((sum, expense) => sum + expense.first_expiration_amount, 0);

    this.stripe = await loadStripe('pk_test_51Q3iwwRwJDdlWggbw9AqW6ETZEuj0aRgDME6NdDAbamdDihYRdK4k0G1dbR3IPNYqm3k2vt1tCpIJKrQ85IR8rNE00mGz2BoE9');
    if (this.stripe) {
      const elements = this.stripe.elements();
      this.cardElement = elements.create('card', {
        style: {
          base: {
            color: '#32325d',
            fontSize: '19px',
            fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
            fontWeight: '400',
            lineHeight: '24px',
            '::placeholder': { color: '#aab7c4' }
          },
          invalid: { color: '#fa755a', iconColor: '#fa755a' },
        },
        hidePostalCode: true,
      });
      this.cardElement.mount('#card-element');
    } else {
      console.error("Stripe no se pudo inicializar");
    }
  }

  async onSubmit() {
    if (this.paymentForm.invalid || !this.stripe || !this.cardElement) {
      return;
    }
    this.processing = true;
    this.error = '';

    try {
      const paymentIntentResponse = await this.createPaymentIntent();
      if (!paymentIntentResponse) {
        throw new Error("Error: No se recibió clientSecret");
      }

      const { clientSecret } = paymentIntentResponse;

      // Confirmación del pago usando el clientSecret
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: this.paymentForm.get('cardHolderName')?.value,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message || "Error al confirmar el pago");
      }

      this.paymentSuccessful = true;
      this.updateExpenseStatus(result.paymentIntent.id);

      //----   sweet alert message   ------
      Swal.fire({
        title: "Pago realizado con exito!",
        text: "Deseas descargar el comprobante ?",
        icon: "success",

        allowOutsideClick: false,
        allowEscapeKey: false,
        backdrop: true,
        confirmButtonColor: "#28a745",
        denyButtonColor: "#17a2b8",
        showDenyButton: true,

        confirmButtonText: "OK",
        denyButtonText: "Descargar"

      }).then((result: any) => {
        if (result.isConfirmed) {
          // Si presiona OK
          this.goBack();

        }
        
        else if (result.isDenied) {
          // Si presiona Descargar
          Swal.fire({
            title: "Descargando...",
            text: "Por favor espera",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
              // Aquí tu lógica de descarga
              this.openPdf().then(() => {
                Swal.fire(
                  "¡Listo!",
                  "El comprobante se ha descargado correctamente",
                  "success"
                  
                );
                this.goBack();
              }).catch(() => {
                Swal.fire(
                  "Error",
                  "No se pudo descargar el comprobante",
                  "error"
                );
                this.goBack();
              });
            }
          });
        }
      });

     // this.paymentStatusMessage = "Pago realizado con éxito";

    } catch (err: any) {
      console.error("Error en el proceso de pago:", err);
      Swal.fire({
        icon: "error",
        title: "Error...",
        text:this.error = err.message || "Error al procesar el pago",
      });
    } finally {
      this.processing = false;
    }
  }

  async createPaymentIntent(): Promise<{ clientSecret: string } | undefined> {
    const currency = 'ars';
    const cardHolderName = this.paymentForm.get('cardHolderName')?.value;
    const dni = this.paymentForm.get('dni')?.value;
    const requestBody = {
      amount: this.total,
      currency: currency,
      cardHolderName: cardHolderName,
      dni: dni
    };

    // Llamada al servicio con la nueva configuración
    const response = await this.checkout.createPaymentIntent(requestBody).toPromise();
    if (!response?.clientSecret) {
      throw new Error("No se recibió clientSecret del backend");
    }
    this.paymentIntentId = response.paymentIntentId;
    return response;
  }


  goBack() {
    this.expenseService.clearSelectedExpenses();
    this.status.emit(1);
  }


  async openPdf() {
    try {
      const response = await fetch(`http://localhost:8020/generate-receipt/${this.paymentIntentId}`);
      if (!response.ok) {
        alert("No se pudo cargar el pdf")
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (error) {
      console.error('There was an error opening the PDF:', error);
    }

  }

  updateExpenseStatus(paymentId: string) {
    const updateDTO = {
      expenseId: this.expensesToPay[0].id,
      status: 'Pago',
      paymentId: paymentId
    };

    this.expenseService.updateStatus(updateDTO).subscribe(
      (response) => {
        console.log('Status updated successfully', response);
      },
      (error) => {
        console.error('Error updating status', error);
      }
    );
  }


}




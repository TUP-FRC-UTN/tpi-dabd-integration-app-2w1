import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { ExpenseGenerationExpenseService } from '../expense-generation-services/expense-generation-expense.service';
import { ExpenseGenerationExpenseInterface } from '../expense-generation-interfaces/expense-generation-expense-interface';
import { Observable, Subscription } from 'rxjs';
import {CommonModule, DatePipe, registerLocaleData} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseGenerationCardComponent } from '../expense-generation-card/expense-generation-card.component';
import { ExpenseGenerationPaymentService } from '../expense-generation-services/expense-generation-payment.service';
import {Router, RouterLink} from '@angular/router';
import localeEsAr from '@angular/common/locales/es-AR';
import { OwnerService } from '../expense-generation-services/expense-generation-owner-service';
import { AuthService } from '../../users/users-servicies/auth.service';
import { environment } from '../../common/environments/environment';
import { RoutingService } from '../../common/services/routing.service';
import { UserService } from '../expense-generation-services/expense-generation-user-service';
import { GetUserDto } from '../expense-generation-interfaces/expense-generation-user';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../common/services/tutorial.service';
registerLocaleData(localeEsAr, 'es-AR');
@Component({
  selector: 'app-expense-generation-user-view',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    ExpenseGenerationCardComponent
],
  providers: [DatePipe],
  templateUrl: './expense-generation-user-view.component.html',
  styleUrl: './expense-generation-user-view.component.css',
})
export class ExpenseGenerationUserViewComponent implements OnInit {

  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;
  
   Math = Math;

  constructor(
    private expenseService: ExpenseGenerationExpenseService,
    private paymentService: ExpenseGenerationPaymentService,
    private routingService: RoutingService,
    private userService: UserService,
    private datePipe:DatePipe,
    private ownerService: OwnerService,
    private authService: AuthService,
    private tutorialService: TutorialService
  ) {
    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        arrow: false,
        canClickTarget: false,
        modalOverlayOpeningPadding: 10,
        modalOverlayOpeningRadius: 10,
        scrollTo: {
          behavior: 'smooth',
          block: 'center'
        }
      },
      useModalOverlay: true,
    }); 
}


  // Arreglos
  expenses$!: Observable<ExpenseGenerationExpenseInterface[]>;
  selectedExpenses: ExpenseGenerationExpenseInterface[] = [];
  paidExpenses: ExpenseGenerationExpenseInterface[] = [];
  unpaidExpenses: ExpenseGenerationExpenseInterface[] = [];
  expenses: ExpenseGenerationExpenseInterface[] = [];


  // Filtros
  startDate: string = '';
  endDate: string = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  maxEndDate: string = '';

  minEndDate: string = '';
  modalState: boolean = false;

  // Variables
  total: number = 0;
  ownerId: number = 0;
  itemsPerPage: number = 5;
  currentPage: number = 1;
  totalItems: number = 0;
  totalPages: number = 0;
  pagedExpenses: any[] = [];
  visiblePages: number[] = [];
  hasSelectedExpenses: boolean = false;
  @Output() status = new EventEmitter<number>();

  ngOnInit() {
    this.expenseService.clearSelectedExpenses;
    
    let userId = this.authService.getUser().id;
    const userRole = this.authService.getActualRole();
      //TUTORIAL
      this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
        () => {
          this.startTutorial();
        }
      ); 
    const processExpenses = (ownerId: number) => {
      this.ownerService.getOwnerByUserId(ownerId).subscribe({
        next: (owner) => {
          if (owner) {
            this.ownerId = owner.id;
            this.getExpensesByOwner();
           
            const today = new Date();
            const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
            this.endDate = localDate.toISOString().split('T')[0];
            this.maxEndDate = localDate.toISOString().split('T')[0];
            this.startDate = new Date(localDate.getFullYear(), 0, 1).toISOString().split('T')[0];
           
            this.selectedExpenses = this.expenseService.getSelectedExpenses();
            this.calculateTotal();
            this.updateButtonState();
          } else {
            console.error('No se encontró un propietario para el usuario logueado');
          }
        },
        error: (error) => {
          console.error('Error al obtener el propietario:', error);
        }
      });
    };

    if(userRole == "Co-Propietario") {
      this.userService.getOwnerBySecondaryOwner(userId).subscribe({
        next: (ownerUser) => {
          if (ownerUser.id) {
            processExpenses(ownerUser.id);
          } else {
            console.error('No se encontró el ID del propietario');
            processExpenses(userId);
          }
        },
        error: (error) => {
          console.error('Error al obtener el propietario', error);
          processExpenses(userId);
        }
      });
    } else {
      processExpenses(userId);
    }
}
  ngOnDestroy() {
    //TUTORIAL
    this.tutorialSubscription.unsubscribe();
    if (this.tour) {
      this.tour.complete();
    }

    
    // Cancelar suscripción del tutorial
    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }

  
  }
  startTutorial() {
    if (this.tour) {
      this.tour.complete();
    }

    // CÓDIGO PARA PREVENIR SCROLLEO DURANTE TUTORIAL
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    const restoreScroll = () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };

    // Al empezar, lo desactiva
    this.tour.on('start', () => {
      document.body.style.overflow = 'hidden';
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });
    });

    // Al completar lo reactiva, al igual que al cancelar
    this.tour.on('complete', restoreScroll);
    this.tour.on('cancel', restoreScroll);
    
    this.tour.addStep({
      id: 'apagar',
      title: 'Documentos a pagar.',
      text: 'Desde acá podrá seleccionar las boletas pendientes que desea pagar.',      attachTo: {
        element: '#apagar',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Siguiente',
          action: this.tour.next,
        }
      ]
      
    });
    
    this.tour.addStep({
      id: 'tabla',
      title: 'Tabla de documentos historicos',
      text: 'Acá puede ver todas las boletas que se emitieron a su nombre, tanto las pendientes, pagadas o exceptuadas.',
      attachTo: {
        element: '#tabla',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        }
      ]
      
    });

    this.tour.addStep({
      id: 'filtros',
      title: 'Filtros',
      text: 'Desde acá podrá filtrar sus boletas emitidas por fecha e importe mínimo y máximo.',
      attachTo: {
        element: '#filtros',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Finalizar',
          action: this.tour.complete
        }
      ]
    });
    this.tour.start();
}



  goToPaymentForm(){
    this.routingService.redirect("/main/invoices/expense-generation-payment-form")
  }

  getExpensesByOwner() {
    this.expenses$ = this.expenseService.getAllExpenses(this.ownerId);
    this.expenses$.subscribe((expenses) => {
      this.unpaidExpenses = expenses.filter(
        (expense) => expense.status !== 'Pago'
      );
      this.paidExpenses = expenses.filter(
        (expense) => expense.status === 'Pago' || expense.status === 'Exceptuado'
      );
    });
  }

  calculateTotal() {
    const selectedExpenses = this.expenseService.getSelectedExpenses();
    this.total = selectedExpenses.reduce((total, expense) => total + expense.actual_amount, 0);
    this.hasSelectedExpenses = selectedExpenses.length > 0;
  }

  recibeAmount(amount: number) {
    this.total += amount;
    this.updateButtonState();
  }

  private updateButtonState() {
    this.selectedExpenses = this.expenseService.getSelectedExpenses();
    this.hasSelectedExpenses = this.selectedExpenses.length > 0;
  }

  onExpenseSelectionChange() {
    this.calculateTotal();
    this.updateButtonState();
  }

  async openPdf(uuid: string) {
    try {
      const cleanUuid = uuid.replace('uuid:', '');
      
      const response = await fetch(
        `${environment.services.expenseGeneration}/api/expenses/pdf/${cleanUuid}`
      );
      if (!response.ok) {
        alert('No se pudo cargar el pdf');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (error) {
      console.error('Hubo un error abriendo el PDF: ', error);
    }
}

  async openReceipt(expense: ExpenseGenerationExpenseInterface) {
    try {
      if (expense.payment_id !== null) {
        const hasLetters = /[a-zA-Z]/.test(expense.payment_id);
        if (hasLetters) {
          const response = await fetch(
            environment.services.stripeService + `/generate-receipt/${expense.payment_id}`
          );
          if (!response.ok) {
            alert('No se pudo cargar el pdf');
          }
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          window.open(url);
        } else {
          const response = await fetch(
            environment.services.mercadoPago + `/api/receipts/${expense.payment_id}/pdf`
          );
          if (!response.ok) {
            alert('No se pudo cargar el pdf');
          }
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          window.open(url);
        }
      }
    } catch (error) {
      console.error('There was an error opening the PDF:', error);
    }
  }

  applyFilters() {
    this.expenseService
      .getAllExpenses(this.ownerId)
      .subscribe((expenses: ExpenseGenerationExpenseInterface[]) => {
        let filteredExpenses = expenses;
        if (this.startDate) {
          const startDate = new Date(this.startDate);
          filteredExpenses = filteredExpenses.filter(
            (expense) => new Date(expense.issueDate) >= startDate
          );
        }

        if (this.endDate) {
          const endDate = new Date(this.endDate);
          filteredExpenses = filteredExpenses.filter(
            (expense) => new Date(expense.issueDate) <= endDate
          );
        }

         // Filtro por importe
         if (this.minAmount !== null) {
          filteredExpenses = filteredExpenses.filter(
            (expense) => expense.amount_payed >= this.minAmount!
          );
        }

        if (this.maxAmount !== null) {
          filteredExpenses = filteredExpenses.filter(
            (expense) => expense.amount_payed <= this.maxAmount!
          );
        }

        this.paidExpenses = filteredExpenses.filter(
          (expense) => expense.status === 'Pago'
        );
      });
  }

  onStartDateChange() {
    if (this.startDate) {
      const startDate = new Date(this.startDate);
      const minEndDate = new Date(startDate);
      minEndDate.setMonth(startDate.getMonth() + 1);
      this.minEndDate = minEndDate.toISOString().split('T')[0];
      if (this.endDate && new Date(this.endDate) < minEndDate) {
        this.endDate = this.minEndDate;
      }
      this.applyFilters();
    }
  }


  onItemsPerPageChange() {
    this.currentPage = 1;
    this.calculateTotalPages();
    this.updateVisiblePages();
    this.updatePagedExpenses();
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }

  updateVisiblePages() {
    const maxVisiblePages = 3;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Ajustar startPage si estamos cerca del final
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    this.visiblePages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }

  updatePagedExpenses() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.totalItems);
    this.pagedExpenses = this.expenses.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updateVisiblePages();
      this.updatePagedExpenses();
    }
  }



  //--------------Pago de Mercado Pago----------------
  payWithMP(expenses: ExpenseGenerationExpenseInterface[]) {
    if (!expenses || expenses.length === 0) {
      alert('Error: No se proporcionaron boletas válidas para pagar.');
      return;
    }

    // Calcular monto total y crear array de detalles por expensa
    const expenseDetails = expenses.map((expense) => ({
      expense_id: parseInt(expense.id.toString()),
      amount:
        typeof expense.actual_amount === 'string'
          ? parseFloat(expense.actual_amount)
          : expense.actual_amount,
    }));

    const totalAmount = expenseDetails.reduce(
      (sum, detail) => sum + detail.amount,
      0
    );
    const initialString:string = expenseDetails.length>1 ? "Pago de las boletas de los periodos:" : "Pago de la boleta del periodo:";

    const description = `${initialString} ${expenses
      .map((exp) => {
        try {
          if (!exp.period) return '';
          
          // Asegurarse de que tenemos el formato MM/YYYY
          const period = exp.period.includes('-') 
            ? exp.period.split('-').reverse().join('/') 
            : exp.period;
          
          const [month, year] = period.split('/');
          const date = new Date(+year, +month - 1, 1);
          
          return isNaN(date.getTime()) 
            ? exp.period 
            : (this.datePipe.transform(date, "MM-yyyy") || exp.period);
        } catch {
          return exp.period; // Retornar el periodo original en caso de error
        }
      })
      .filter(Boolean) // Eliminar strings vacíos
      .join(', ')}`;
    const paymentData = {
      description: description,
      amount: totalAmount,
      details: expenseDetails,
      ownerId: this.ownerId,
    };

    console.log(paymentData);
    this.paymentService.createPaymentRequest(paymentData).subscribe({
      next: (preferenceId: string) => {
        const mercadoPagoUrl = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;
        window.open(mercadoPagoUrl, '_blank');
      },
      error: (error: any) => {
        console.error('Error al crear la solicitud de pago múltiple:', error);
        alert('Hubo un error al procesar el pago. Inténtalo de nuevo.');
      },
    });
  }
}

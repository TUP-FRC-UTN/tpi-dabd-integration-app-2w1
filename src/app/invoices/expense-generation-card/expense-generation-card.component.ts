import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExpenseGenerationExpenseInterface } from '../expense-generation-interfaces/expense-generation-expense-interface';
import { ExpenseGenerationExpenseService } from '../expense-generation-services/expense-generation-expense.service';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { environment } from '../../common/environments/environment';
registerLocaleData(localeEsAr, 'es-AR');

@Component({
  selector: 'app-expense-generation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-generation-card.component.html',
  styleUrl: './expense-generation-card.component.css',
})
export class ExpenseGenerationCardComponent implements OnInit {
  @Input() expense!: ExpenseGenerationExpenseInterface;
  @Output() sendAmount = new EventEmitter<number>();
  @Output() expenseSelectionChange = new EventEmitter<void>();

  overdue: boolean = false;
  status: boolean = false;
  periodo: string = '';

  constructor(public expenses: ExpenseGenerationExpenseService) {}

  ngOnInit() {
    
    // SI LA FECHA DE VENCIMIENTO ES MENOR A LA FECHA ACTUAL, LA BOLETA ESTA VENCIDA
    if (
      this.expense.first_expiration_date !== null &&
      this.expense.first_expiration_date !== undefined &&
      this.expense.first_expiration_date < new Date().toISOString()
    ) {
      this.overdue = true;
    }
  }

  // METODO QUE LE PEGA AL ENDPOINT PARA ABRIR EL PDF

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


  // METODO QUE ENVIA EL MONTO DE LA BOLETA AL COMPONENT PADRE

  selectExpense() {
    if (!this.status) {
      this.expenses.addSelectedExpense(this.expense);
      this.sendAmount.emit(this.expense.actual_amount);
      this.status = true;
    } else {
      this.expenses.removeSelectedExpense(this.expense.id);
      this.sendAmount.emit(-this.expense.actual_amount);
      this.status = false;
    }

    // Emitir el cambio de selección
    this.expenseSelectionChange.emit();
  }
}

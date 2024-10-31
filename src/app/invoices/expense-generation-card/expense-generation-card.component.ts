import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExpenseGenerationExpenseInterface } from '../expense-generation-interfaces/expense-generation-expense-interface';
import { ExpenseGenerationExpenseService } from '../expense-generation-services/expense-generation-expense.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expense-generation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-generation-card.component.html',
  styleUrl: './expense-generation-card.component.css'
})
export class ExpenseGenerationCardComponent implements OnInit {


  @Input() expense!: ExpenseGenerationExpenseInterface;
  @Output() sendAmount = new EventEmitter<number>();


  overdue: boolean = false;
  status: boolean = false;
  periodo: string = "";


  constructor(public expenses: ExpenseGenerationExpenseService){}


  ngOnInit() {
    // SI LA FECHA DE VENCIMIENTO ES MENOR A LA FECHA ACTUAL, LA BOLETA ESTA VENCIDA
    if (this.expense.first_expiration_date !== null && this.expense.first_expiration_date !== undefined && this.expense.first_expiration_date < new Date().toISOString()) {
      this.overdue = true;
    }


  
  }

  // METODO QUE LE PEGA AL ENDPOINT PARA ABRIR EL PDF

  async openPdf(id: number) {
    try {
      const response = await fetch(`http://localhost:8021/api/expenses/pdf/${id}`);
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




  // METODO QUE ENVIA EL MONTO DE LA BOLETA AL COMPONENT PADRE

   selectExpense() {
    if (this.status === false) {
      this.expenses.addSelectedExpense(this.expense);
      this.sendAmount.emit(this.expense.first_expiration_amount);
    //  console.log(this.expenses.getSelectedExpenses());
      
      this.status = true;
    } else {
      this.expenses.removeSelectedExpense( this.expense.id);
      this.sendAmount.emit(-this.expense.first_expiration_amount);
     // console.log(this.expenses.getSelectedExpenses());
      this.status = false;
    }
  }



}

import { Component } from '@angular/core';
import { ExpenseGenerationUserViewComponent } from "../expense-generation-user-view/expense-generation-user-view.component";
import { ExpenseGenerationPaymentFormComponent } from "../expense-generation-payment-form/expense-generation-payment-form.component";

@Component({
  selector: 'app-expense-generation-view',
  standalone: true,
  imports: [ExpenseGenerationUserViewComponent, ExpenseGenerationPaymentFormComponent],
  templateUrl: './expense-generation-view.component.html',
  styleUrl: './expense-generation-view.component.css'
})
export class ExpenseGenerationViewComponent {

  status: number = 1;

  reciveStatus(status: number){
    this.status = status;
  }


}

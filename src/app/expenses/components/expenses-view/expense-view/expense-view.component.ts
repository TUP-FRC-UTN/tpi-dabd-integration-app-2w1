import { Component, Input } from '@angular/core';
import {CommonModule } from '@angular/common'
import { ExpenseView } from '../../../models/expenseView';


@Component({
  selector: 'app-expense-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-view.component.html',
  styleUrl: './expense-view.component.css',

})
export class ExpenseViewComponent {

  @Input() expense: ExpenseView | null = null;

  hasDistribution():Boolean{
    let result : Boolean = false;
    if(this.expense != null && this.expense.distributionList !=null && this.expense.distributionList.length>0){
      result =true;
    }
    return result;
  }

}

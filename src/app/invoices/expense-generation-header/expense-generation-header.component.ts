import { Component } from '@angular/core';
import { ExpenseGenerationAdminViewComponent } from '../expense-generation-admin-view/expense-generation-admin-view.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expense-generation-header',
  standalone: true,
  imports: [ExpenseGenerationAdminViewComponent],
  templateUrl: './expense-generation-header.component.html',
  styleUrl: './expense-generation-header.component.css'
})
export class ExpenseGenerationHeaderComponent {

  constructor(private router: Router) {}

  ChangeAdminView() {
    this.router.navigate(['/expense-generation-admin-view']);
  }

}

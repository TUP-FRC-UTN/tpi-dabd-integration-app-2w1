import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Category } from '../models/category';
import { CategoryService } from '../services/expensesCategoryServices/category.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-expense-register-category',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './expense-register-category.component.html',
  styleUrl: './expense-register-category.component.scss'
})
export class ExpenseRegisterCategoryComponent {
  private readonly categoryService = inject(CategoryService);

   category : Category = {
     description: '',
     id: 0,
     lastUpdatedDatetime: '',
     state: ''
   }
  @Output() eventSucces = new EventEmitter<void>();
  @Output() eventError = new EventEmitter<void>();


  save() {
    if(this.category!=null)
    this.categoryService.add(this.category).subscribe({
      next: () => {
        this.eventSucces.emit()
      },
      error: () => {
        this.eventError.emit()
      }
    })
    }
}

import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/expensesCategoryServices/category.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-expense-register-category',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './expenses-register-category.component.html',
  styleUrl: './expenses-register-category.component.scss'
})
export class ExpenseRegisterCategoryComponent {


  private readonly categoryService = inject(CategoryService);

  // Declaramos el FormGroup
  categoryForm: FormGroup;

  @Output() eventSucces = new EventEmitter<void>();
  @Output() eventError = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private modal: NgbActiveModal) {
    this.categoryForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  close(){
    this.modal.close()
  }
  clearInputs() {
    this.categoryForm.reset();
    this.close()
  }

  validateDescription(): boolean {
    return this.categoryForm.get('description')?.invalid || false;
  }

  save() {
    if (this.categoryForm.valid) {
      const category = {
        description: this.categoryForm.get('description')?.value,
        id: 0,
        lastUpdatedDatetime: '',
        state: ''
      };

      this.categoryService.add(category).subscribe({
        next: () => {
          this.eventSucces.emit();
          this.clearInputs();
        },
        error: (error) => {
          if (error.error) {
            switch (error.error.status) {
              case 400:
                if (error.error.message === "The description is required") {
                  this.eventError.emit(`La descripción es requerida`);
                }
                break;
              case 409:
                if (error.error.message === "A category with this description already exists") {
                  this.eventError.emit(`La categoría "${category.description}" ya existe`);
                }
                break;
              default:
                this.eventError.emit('La categoría no pudo registrarse');
                break;
            }
          } else {
            this.eventError.emit('La categoría no pudo registrarse');
          }
          this.clearInputs();
        }
      });
    }
  }
}

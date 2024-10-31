import { Component, EventEmitter, Input, OnDestroy, OnInit, Output,ViewChild  } from '@angular/core';
import { FormsModule,NgModel  } from '@angular/forms';
import { CategoryService } from '../../../../services/expenses-services/expensesCategoryServices/category.service';
import { Category } from '../../../../models/expenses-models/category';
import { filter, map, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-expense-categories-select',
  standalone: true,
  imports: [FormsModule],
  providers:[CategoryService],
  templateUrl: './expense-categories-select.component.html',
  styleUrl: './expense-categories-select.component.css'
})
export class ExpenseCategoriesSelectComponent implements OnInit, OnDestroy{
  constructor(private categoryService:CategoryService){}
  @ViewChild('internalCategoryId') internalCategoryId!: NgModel;
  categoryList : Category[]=[];
  @Input() selectedCategoryId : number =0;
  @Input() removeEmpty: boolean =false;
  @Output() selectedCategoryIdChange = new EventEmitter<number>();
  private destroy$ = new Subject<void>();
  ngOnInit(): void {
    this.loadCategories();
    console.log(this.removeEmpty)
  }
  ngOnDestroy(): void {
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }

  loadCategories(): void {
    this.categoryService.getCategory()
      .pipe(
        takeUntil(this.destroy$),
        map((categories) => 
          categories.filter(category => category.state === 'Activo')
        )
      )
      .subscribe((categories) => {
        this.categoryList = categories;
        }
      );
  }
  onCategoryChange(selectedValue: number): void {
    this.selectedCategoryIdChange.emit(selectedValue);
  }
}


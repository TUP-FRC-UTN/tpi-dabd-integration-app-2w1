import { Component, Input, OnInit } from '@angular/core';
import { Category } from '../../models/category';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-expenses-view-category-details',
  templateUrl: './expenses-view-category-details.component.html',
  standalone:true,
  imports: [
    FormsModule,
    DatePipe,
    NgFor,
    NgIf,
    CommonModule,
  ],
  styleUrl: './expenses-view-category-details.component.css'
})
export class ExpensesViewCategoryDetailsComponent implements OnInit {
  ngOnInit(): void {
    console.log(this.category)
  }

  @Input() category: Category | null = null;
 
  
}

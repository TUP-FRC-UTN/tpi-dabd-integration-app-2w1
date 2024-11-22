import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExpenseType } from '../../models/expenseType';

@Component({
  selector: 'app-expenses-type-expense-ng-select',
  standalone: true,
  imports: [NgSelectModule,FormsModule],
  templateUrl: './expenses-type-expense-ng-select.component.html',
  styleUrl: './expenses-type-expense-ng-select.component.scss'
})
export class ExpensesTypeExpenseNgSelectComponent implements OnInit  {
  
  @Input() selectedTypes: ExpenseType[] = [];
  @Input() selectedType: string = "";
  @Input() multiple: Boolean = true;
  @Input() noteCredit: boolean = false;

  @Output() selectedTypesChange = new EventEmitter<ExpenseType[]>();
  @Output() selectedTypeChange = new EventEmitter<string>();
  @Input() showValidBorder: boolean = false;
  expenseTypeList: ExpenseType[] = [];
  isBlurred: boolean = false;

  ngOnInit(): void {
    this.expenseTypeList = [];
    this.expenseTypeList.push(
      {
        id: "COMUN",
        description: "Común"
      },
      {
        id: "INDIVIDUAL",
        description: "Individual"
      },
      {
        id: "EXTRAORDINARIO",
        description: "Extraordinario"
      }
    );
    
    if(this.noteCredit) {
      this.expenseTypeList.push({
        id: "NOTE_OF_CREDIT",
        description: "Nota de Credito"
      });
    }
  }

  onTypeChange(): void {
    if(this.multiple) {
      this.selectedTypesChange.emit(this.selectedTypes);
    } else {
      this.selectedTypeChange.emit(this.selectedType);
    }
  }

  onBlur(): void {
    this.isBlurred = true;
  }

  isValid(): boolean {
    if (!this.isBlurred) return false;
    
    if (this.multiple) {
      return this.selectedTypes && this.selectedTypes.length > 0;
    } else {
      return this.selectedType !== "";
    }
  }

  set selectValue(value: any) {
    if(this.multiple) {
      this.selectedTypes = value;
    } else {
      this.selectedType = value;
    }
  }

  get selectValue() {
    return this.multiple ? this.selectedTypes : this.selectedType;
  }
}

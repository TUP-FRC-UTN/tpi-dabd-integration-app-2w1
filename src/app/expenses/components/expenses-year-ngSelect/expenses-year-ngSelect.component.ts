import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
@Component({
  selector: 'app-expenses-year-ngSelect',
  standalone:true,
  imports: [NgSelectModule,FormsModule],
  templateUrl: './expenses-year-ngSelect.component.html',
  styleUrls: ['./expenses-year-ngSelect.component.css']
})
export class ExpensesYearNgSelectComponent  {

  @Input() selectedYear: number = 0;
  @Input() yaersList: number[]=[];
  @Output() selectedYearChange = new EventEmitter<number>();
  constructor() { }

  
  onYearChange(): void {
    
    this.selectedYearChange.emit(this.selectedYear);
    
  }
  
  set selectValue(value:any){
   
      this.selectedYear = value;
    
  }
  get selectValue(){
    return this.selectedYear
  }

}

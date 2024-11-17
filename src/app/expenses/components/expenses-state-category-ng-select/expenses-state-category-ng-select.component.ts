import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-expenses-state-category-ng-select',
  standalone: true,
  imports: [NgSelectModule,CommonModule,FormsModule],
  templateUrl: './expenses-state-category-ng-select.component.html',
  styleUrl: './expenses-state-category-ng-select.component.scss'
})
export class ExpensesStateCategoryNgSelectComponent {

  @Input() selectedStates : any[] =[]
  @Input() selectedState : string =''
  states: any[]=[]
  @Input() multiple:Boolean=true;
  @Output() selectedStateChange = new EventEmitter<string>();
  @Output() selectedStatesChange = new EventEmitter<any[]>();
  ngOnInit(): void {
    
    this.loadStates();
  }
  loadStates() {
    this.states.push({id:'Inactivo',description:'Inactivo'})
    this.states.push({id:'Activo',description:'Activo'})
  }
  onStateChange(): void {
    if(this.multiple){
      this.selectedStatesChange.emit(this.selectedStates);
    }else{
      this.selectedStateChange.emit(this.selectedState);
    }
  }
  set selectValue(value:any){
    if(this.multiple){
      this.selectedStates = value;
    }else{
      this.selectedState = value;
    }
  }
  get selectValue(){
    return this.multiple ? this.selectedStates : this.selectedState
  }
}

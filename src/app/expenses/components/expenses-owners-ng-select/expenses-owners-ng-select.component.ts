import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Owner } from '../../models/owner';
import { OwnerService } from '../../services/ownerServices/owner.service';
import { Subject, takeUntil } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-expenses-owners-ng-select',
  standalone: true,
  imports: [NgSelectModule,FormsModule],
  templateUrl: './expenses-owners-ng-select.component.html',
  styleUrl: './expenses-owners-ng-select.component.scss'
})
export class ExpensesOwnersNgSelectComponent implements OnInit, OnDestroy {

  @Input() selectedOwners: Owner[] =[];
  @Input() selectedOwner: number=0;
  @Input() multiple:Boolean=true;
  @Output() selectedOwnersChange = new EventEmitter<Owner[]>();
  @Output() selectedOwnerChange = new EventEmitter<number>();

  ownersList : Owner[]=[];
  private destroy$ = new Subject<void>();
  constructor(private ownerService: OwnerService){} 
  ngOnInit(): void {
    this.loadOwners();
  }
  ngOnDestroy(): void {
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }
  loadOwners(): void{
    this.ownerService.getOwners().pipe(takeUntil(this.destroy$)).subscribe(
      (owners) => {
        this.ownersList = owners;
        console.log(this.ownersList)
      },
      (error)=>{
        console.log('Error al obtener owners',error);
      }
    );
  }
  onOwnerChange():void{
    if(this.multiple){
      this.selectedOwnersChange.emit(this.selectedOwners);
    }else{
      this.selectedOwnerChange.emit(this.selectedOwner);
    }
  }
  set selectValue(value:any){
    if(this.multiple){
      this.selectedOwners = value;
    }else{
      this.selectedOwner = value;
    }
  }
  get selectValue(){
    return this.multiple ? this.selectedOwners : this.selectedOwner
  }

}

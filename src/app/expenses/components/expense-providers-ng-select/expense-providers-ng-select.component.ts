import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProviderService } from '../../services/providerServices/provider.service';
import { Provider } from '../../models/provider';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-expense-providers-ng-select',
  standalone: true,
  imports: [NgSelectModule,FormsModule],
  providers:[ProviderService],
  templateUrl: './expense-providers-ng-select.component.html',
  styleUrl: './expense-providers-ng-select.component.scss'
})
export class ExpenseProvidersNgSelectComponent implements OnInit, OnDestroy  {

  /*Lo utilizo two bind, el componente padre le envia la lista o el valor seleccionado
  Para hacer el two bind de esta forma el Output debe llamarse igual al Input pero con sufijo "Change"
  No probe si es necesario que el EventEmitter emita el valor o puede ser void, pero lo dejo asi
  por si es necesari capturar el valor mediente el metodo y no el two bind
  */
  //Si uso el multiple uso esto
  @Input() selectedProviders: Provider[] =[];
  //Si es individual uso esto
  @Input() selectedProvider: number=0;
  //Bandera para indicar si uso multiple select o individual
  @Input() multiple:Boolean=true;
  //Bandera para indicar si agrego un elemento sin descripcion
  @Input() emptyValue: Boolean= false;
  //Si uso el multiple emito esto
  @Output() selectedProvidersChange = new EventEmitter<Provider[]>();
  //Si es individual emito esto
  @Output() selectedProviderChange = new EventEmitter<number>();
  
  
  /*La lista que viene del servicio, si van a seguir manejando desde el padre la logica del servicio
  esto deberia ser un input
  */
  providersList : Provider[] = [];
  //Para cancelar la sub al service
  private destroy$ = new Subject<void>();
  constructor(private providerService: ProviderService){}
  ngOnInit(): void {
    //Al iniciar busco la lista del servicio
    this.loadProviders();
  }
  ngOnDestroy(): void {
    //Limpio las subscripciones
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }


  loadProviders(): void {
    this.providerService.getProviders()
      .pipe(takeUntil(this.destroy$)) 
      .subscribe(
        (providers) => {
          this.providersList = providers;
          console.log(this.providersList)
          //Si necesito el elemento empty lo agrego
          if (this.emptyValue) {
            this.providersList.push({ id: 0, description: '' });
            
          }
          this.providersList.sort((a, b) => a.description.localeCompare(b.description));
        },
        (error) => {
          console.error('Error loading providers:', error);
        }
      );
  }
  //Evento que uso cada vez que el ng-select cambia, deacuerdo a si es multiple o no, emite el evento correspondiene
  onProviderChange(): void {
    if(this.multiple){
      this.selectedProvidersChange.emit(this.selectedProviders);
    }else{
      this.selectedProviderChange.emit(this.selectedProvider);
    }
  }

  /*
    Get y Set utilizado para pasar gestionar los valores seleccionados,
    hay que usarlos asi porque de acuerdo si es multiple o no, el valor cambia
    entonces de esta forma manejas la logica de que valor tiene que tomar o recibir el
    ng select, esto en el html es asi [(ngModel)] = "selectValue"
  */
  set selectValue(value:any){
    if(this.multiple){
      this.selectedProviders = value;
    }else{
      this.selectedProvider = value;
    }
  }
  get selectValue(){
    return this.multiple ? this.selectedProviders : this.selectedProvider
  }
  
}

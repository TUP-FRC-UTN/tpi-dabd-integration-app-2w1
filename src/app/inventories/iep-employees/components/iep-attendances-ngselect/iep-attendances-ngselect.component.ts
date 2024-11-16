import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-iep-attendances-ngselect',
  standalone: true,
  imports: [NgSelectModule,FormsModule],
  templateUrl: './iep-attendances-ngselect.component.html',
  styleUrl: './iep-attendances-ngselect.component.css'
})
export class IepAttendancesNgselectComponent {
  
  //Si es grupal uso esto
  @Input() selectedProviders: any[] =[];
  //Si es individual uso esto
  @Input() selectedProvider: string = "";
  //Bandera para indicar si uso multiple select o individual
  @Input() multiple:Boolean=true;
  //Bandera para indicar si agrego un elemento sin descripcion
  @Input() emptyValue: Boolean= false;
  //Si uso el multiple emito esto
  @Output() selectedProvidersChange = new EventEmitter<any[]>();
  //Si es individual emito esto
  @Output() selectedProviderChange = new EventEmitter<string>();
 
 
  /*La lista que viene del servicio, si van a seguir manejando desde el padre la logica del servicio
  esto deberia ser un input
  */
  providersList : any[] = [
    {name: "Presente", value: "PRESENTE"},{name: "Tarde", value: "TARDE"},
    {name: "Ausente", value: "AUSENTE"},{name: "Justificado", value: "JUSTIFICADO"}];

   //Evento que uso cada vez que el ng-select cambia, deacuerdo a si es multiple o no, emite el evento correspondiene
  onProviderChange(): void {
    this.selectedProvidersChange.emit(this.selectedProviders);
    // if(this.multiple){
    // }else{
    //   this.selectedProviderChange.emit(this.selectedProvider);
    // }
  }


  /*
    Get y Set utilizado para pasar gestionar los valores seleccionados,
    hay que usarlos asi porque de acuerdo si es multiple o no, el valor cambia
    entonces de esta forma manejas la logica de que valor tiene que tomar o recibir el
    ng select, esto en el html es asi [(ngModel)] = "selectValue"
  */
  set selectValue(value:any){
    this.selectedProviders = value;
    // if(this.multiple){
    // }else{
    //   this.selectedProvider = value;
    // }
  }
  get selectValue(){
    return this.selectedProviders;
  }
 
}



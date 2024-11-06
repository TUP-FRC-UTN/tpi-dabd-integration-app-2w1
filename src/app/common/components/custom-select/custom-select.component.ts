import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgLabelTemplateDirective, NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [NgSelectModule, FormsModule, NgLabelTemplateDirective],
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.scss'
})
export class CustomSelectComponent implements OnInit{
  //Lista de opciones (Requiere un objeto {value: , name: })
  @Input() options : any[] = []

  //Lista con los VALUES de los objetos que ya tienen que venir seleccionados (Ej: [1, 2] o ["Persona Física"])
  @Input() optionsChecked : any[] = []

  //Permite seleccionar varios objetos
  @Input() multiple : boolean = true;

  //Listado de ids de los objetos seleccionados (el value del select)
  @Output() sendList = new EventEmitter<any[]>();


  //Opciones seleccionadas
  selectedOptions : any[] = [];

  ngOnInit(): void {
    this.selectedOptions = (this.optionsChecked ? this.optionsChecked : [])
  }

  send(){
    this.sendList.emit(this.selectedOptions);
  }

}

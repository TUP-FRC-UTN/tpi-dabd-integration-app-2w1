import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { NgLabelTemplateDirective, NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [NgSelectModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.scss'
})
export class CustomSelectComponent {
  //Lista de opciones (Requiere un objeto {value: , name: })
  @Input() options: any[] = []

  //Permite seleccionar varios objetos
  @Input() multiple: boolean = false;

  //Lista con los VALUES de los objetos que ya tienen que venir seleccionados (Ej: [1, 2] o ["Persona Física"])
  @Input() selectedOptions: any[] = [];

  //Lista de las validaciones que este necesitara usar
  @Input() validations: ValidatorFn | null | undefined = null

    //Lista de las validaciones que este necesitara usar
    @Input() placeholder: string = 'Seleccione...'

  //Listado de ids de los objetos seleccionados (el value del select)
  @Output() selectedOptionsChange = new EventEmitter<any[]>();

  reactiveForm: FormGroup;
  selectControl: FormControl;


  //Constructor
  constructor(private fb: FormBuilder) {
    this.selectControl = this.fb.control(this.selectedOptions, [], );
    this.reactiveForm = this.fb.group({
      selectControl: this.selectControl
    });

    //Emite los items seleccionados cuando estos cambian dentro del componente
    this.selectControl.valueChanges.subscribe(values => {
      this.selectedOptionsChange.emit(values);
    })
  }

  //Devuelve los valores necesarios para mostrar los inputs en verde o rojo segun la validacion
  onValidate(controlName: string) {
    this.selectControl.setValidators(this.validations!)
    if(this.validations){
      const control = this.reactiveForm.get(controlName);
      return {
        'is-invalid': control?.invalid && (control?.dirty || control?.touched),
        'is-valid': control?.valid
      }
    }
    return '';
  }

  //Controla que se tenga que enviar un mensaje de error, lo busca y retorna
  showError(controlName: string): string {
    const control = this.reactiveForm.get(controlName);

    if (control?.errors && control.invalid && (control.dirty || control.touched)) {
      const errorKey = Object.keys(control.errors)[0];
      return this.getErrorMessage(errorKey, control.errors[errorKey]);
    }
    return '';
  }

  //Devuelve el mensaje de error
  private getErrorMessage(errorKey: string, errorValue: any): string {
    const errorMessages: { [key: string]: (error: any) => string } = {
      required: () => 'Este campo no puede estar vacío.',
      email: () => 'Formato de correo electrónico inválido.',
      minlength: (error) => `El valor ingresado es demasiado corto. Mínimo ${error.requiredLength} caracteres.`,
      maxlength: (error) => `El valor ingresado es demasiado largo. Máximo ${error.requiredLength} caracteres.`,
      pattern: () => 'El formato ingresado no es válido.',
      min: (error) => `El valor es menor que el mínimo permitido (${error.min}).`,
      max: (error) => `El valor es mayor que el máximo permitido (${error.max}).`,
      requiredTrue: () => 'Debe aceptar el campo requerido para continuar.',
      date: () => 'La fecha ingresada es inválida.',
      url: () => 'El formato de URL ingresado no es válido.',
      number: () => 'Este campo solo acepta números.',
      customError: () => 'Error personalizado: verifique el dato ingresado.'
    };

    return errorMessages[errorKey]?.(errorValue) ?? 'Error no identificado en el campo.';
  }


  //Limpia la/las opciones seleccionadas
  setData(value: any[]){
    this.selectControl.setValue(value);
  }

  //Alterna la seleccion sel item al tocar sobre la label (Por problemas en la seleccion multiple)
  toggleSelection(item: any): void {
    item.selected = !item.selected;
  }
}





import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../../services/complaints.service';
import { Router, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RoutingService } from '../../../../common/services/routing.service';
import { ReportReasonDto } from '../../../models/ReportReasonDTO';
import { CustomSelectComponent } from "../../../../common/components/custom-select/custom-select.component";

@Component({
  selector: 'app-penalties-post-complaint',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterModule, CustomSelectComponent],
  templateUrl: './penalties-post-complaint.component.html',
  styleUrl: './penalties-post-complaint.component.scss'
})
export class PenaltiesPostComplaintComponent implements OnInit {
  //Variables
  complaintTypes: string[] = [];
  reactiveForm: FormGroup;
  files: File[] = [];
  otroSelected: boolean = false;
  options: { name: string, value: any }[] = []
  
  //Constructor
  constructor(
    private complaintService: ComplaintService,
    private formBuilder: FormBuilder,
    private routingService: RoutingService
  ) {
    this.reactiveForm = this.formBuilder.group({  //Usen las validaciones que necesiten, todo lo de aca esta puesto a modo de ejemplo
      complaintReason: new FormControl([], [Validators.required]),
      anotherReason: new FormControl(''),
      descriptionControl: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]),
      fileControl: new FormControl(null),
    });
  }

  updateSelect(data : any){
    this.reactiveForm.get('complaintReason')?.setValue(data)
  }


  //Init
  ngOnInit(): void {
    this.getTypes();

    // Escuchar cambios en 'complaintReason' para activar o desactivar la validación
    this.reactiveForm.get('complaintReason')?.valueChanges.subscribe(value => {
      const anotherReasonControl = this.reactiveForm.get('anotherReason');

      if (value === 'Otro') {
        anotherReasonControl?.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(48)]);
      } else {
        anotherReasonControl?.clearValidators();
      }

      // Actualizar el estado de validación de 'anotherReason'
      anotherReasonControl?.updateValueAndValidity();
    });
  }


  //Submit del form
  onSubmit(): void {
    if (this.reactiveForm.valid) {
      let formData = this.reactiveForm.value;
      let data = {
        userId: 1,
        complaintReason: formData.complaintReason,
        anotherReason: formData.anotherReason,
        description: formData.descriptionControl,
        pictures: this.files
      };

      this.complaintService.add(data).subscribe(res => {
        Swal.fire({
          title: '¡Denuncia enviada!',
          text: 'La denuncia ha sido enviada correctamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        this.routingService.redirect("main", "Página Principal")
      }, error => {
        console.error('Error al enviar la denuncia', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo enviar la denuncia. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      })
    };
  }

  //
  cancel() {
    this.routingService.redirect("main", "Página Principal")
  }


  //
  onValidate(controlName: string) {
    const control = this.reactiveForm.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }

  show(){
    console.log("Formulario:", this.reactiveForm.value)
  }


  //
  showError(controlName: string): string {
    const control = this.reactiveForm.get(controlName);
    
    if (control?.errors && control.invalid && (control.dirty || control.touched)) {
      const errorKey = Object.keys(control.errors)[0];
      return this.getErrorMessage(errorKey, control.errors[errorKey]);
    }
    return '';
  }

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


  //Trae los tipos de la base de datos
  getTypes(): void {
    this.complaintService.getAllReportReasons().subscribe(
      (reasons: ReportReasonDto[]) => {
        reasons.push({    id: 0,
          reportReason: "Otro",
          baseAmount: 0})
        reasons.forEach((reason) => this.complaintTypes.push(reason.reportReason))
        
        this.options = this.complaintTypes.map(opt => ({ name: opt, value: opt }))
      },
      (error) => {
        console.error('error: ', error);
      }
    )
  }


  // This method formats a date
  // to send it to the input.
  // Param 'date' The date to be formatted.
  // Returns the date as a string in the format "yyyy-MM-dd".
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  // This method updates the list of 
  // files to the currently selected ones.
  onFileChange(event: any) {
    this.files = Array.from(FileList = event.target.files); //Convertir FileList a Array
  }

}

import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../../services/complaintsService/complaints.service';
import { Router, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-penalties-post-complaint',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './penalties-post-complaint.component.html',
  styleUrl: './penalties-post-complaint.component.scss'
})
export class PenaltiesPostComplaintComponent implements OnInit {
  //Variables
  complaintTypes: { key: string; value: string }[] = [];
  reactiveForm: FormGroup;
  files: File[] = [];


  //Constructor
  constructor(
    private complaintService: ComplaintService,
    private router: Router,
    private formBuilder: FormBuilder
  ) { 
    this.reactiveForm = this.formBuilder.group({  //Usen las validaciones que necesiten, todo lo de aca esta puesto a modo de ejemplo
      typeControl: new FormControl('', [Validators.required]),
      descriptionControl: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]),
      fileControl: new FormControl(null),
    });
  }


  //Init
  ngOnInit(): void {
    this.getTypes();
  }


  //Submit del form
  onSubmit(): void {
    if (this.reactiveForm.valid) {
      let formData = this.reactiveForm.value;
      let data = {
        userId: 1,
        complaintType: formData.typeControl,
        description: formData.descriptionControl,
        pictures: this.files
      }

      this.complaintService.add(data).subscribe({
        next: (response) => {
          //Redireccion a otra ruta
          console.log('Denuncia enviada correctamente', response);
          this.router.navigate(['home/complaints/listComplaint']);
        },
        error: (error) => {
          console.error('Error al enviar la denuncia', error);
        }
      });
    }
  }


  //Retorna una clase para poner el input en verde o rojo dependiendo si esta validado
  onValidate(controlName: string) {
    const control = this.reactiveForm.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }


  //Retorna el primer error encontrado para el input dentro de los posibles
  showError(controlName: string) {
    const control = this.reactiveForm.get(controlName);
    //Si encuentra un error retorna un mensaje describiendolo
    if (control && control.errors) {
      const errorKey = Object.keys(control!.errors!)[0];
      switch (errorKey) {
        case 'required':
          return 'Este campo no puede estar vacío.';
        case 'email':
          return 'Formato de correo electrónico inválido.';
        case 'minlength':
          return `El valor ingresado es demasiado corto. Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `El valor ingresado es demasiado largo. Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
        case 'pattern':
          return 'El formato ingresado no es válido.';
        case 'min':
          return `El valor es menor que el mínimo permitido (${control.errors['min'].min}).`;
        case 'max':
          return `El valor es mayor que el máximo permitido (${control.errors['max'].max}).`;
        case 'requiredTrue':
          return 'Debe aceptar el campo requerido para continuar.';
        case 'date':
          return 'La fecha ingresada es inválida.';
        case 'url':
          return 'El formato de URL ingresado no es válido.';
        case 'number':
          return 'Este campo solo acepta números.';
        case 'customError':
          return 'Error personalizado: verifique el dato ingresado.';
        default:
          return 'Error no identificado en el campo.';
      }
    }
    //Si no se cumplen ninguno de los anteriores retorna vacio
    return '';
  }


  //Carga de datos del service para el select (Propio del micro de multas)
  getTypes(): void {
    this.complaintService.getTypes().subscribe({
      next: (data) => {
        this.complaintTypes = Object.keys(data).map(key => ({
          key,
          value: data[key]
        }));
      },
      error: (error) => {
        console.error('error: ', error);
      }
    })
  }


  //Formatea la fecha en yyyy-MM-dd para enviarla al input
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  //Evento para actualizar el listado de files a los seleccionados actualmente
  onFileChange(event: any) {
    this.files = Array.from(FileList = event.target.files); //Convertir FileList a Array
  }

}

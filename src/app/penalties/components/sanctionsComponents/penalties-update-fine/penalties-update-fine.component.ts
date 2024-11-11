import { Component, OnInit } from '@angular/core';
import { PenaltiesSanctionsServicesService } from '../../../services/sanctionsService/sanctions.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RoutingService } from '../../../../common/services/routing.service';
@Component({
  selector: 'app-penalties-update-fine',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './penalties-update-fine.component.html',
  styleUrl: './penalties-update-fine.component.scss'
})
export class PenaltiesUpdateFineComponent implements OnInit {
  userId: number;
  fineIdFromList: number;
  fine: any;
  reactiveForm: FormGroup;
  constructor(private penaltiesService: PenaltiesSanctionsServicesService,
    private router: Router,
    private route: ActivatedRoute,
    formBuilder: FormBuilder,
    private routingService: RoutingService
  ) {
    this.userId = 1;
    this.fineIdFromList = 0; //Esto deberia venir del listado
    this.reactiveForm = formBuilder.group({
      amountControl: new FormControl('', [Validators.required, Validators.min(0)])
    })
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.fineIdFromList = + params.get('fineId')!;
      this.getFine(this.fineIdFromList);
    });
  }


  //
  getFine(fineId: number) {
    this.penaltiesService.getFineById(fineId).subscribe(
      (response) => {
        console.log(response);
        this.fine = response
        this.reactiveForm.get('amountControl')?.setValue(this.fine.amount)
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }


  //
  onSubmit() {
    const fineData = {
      id: this.fineIdFromList,
      amount: this.reactiveForm.value.amountControl,
      userId: 10
    };
    //Envio de formulario

    // Envío de formulario solo después de la confirmación
    this.penaltiesService.updateFine(fineData).subscribe(res => {
      Swal.fire({
        title: '¡Multa actualizada!',
        text: 'La multa  ha sido actualizada correctamente.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      this.routingService.redirect("main/sanctions/sanctions-list", "Listado de Infracciones")
    }, error => {
      console.error('Error al actualizar la multa', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar la multa. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    })
  };

  //
  cancel() {
    this.routingService.redirect("main/sanctions/sanctions-list", "Listado de Infracciones")
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
}

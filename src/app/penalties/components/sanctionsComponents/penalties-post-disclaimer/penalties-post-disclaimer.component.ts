import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PenaltiesSanctionsServicesService } from '../../../services/sanctionsService/sanctions.service';

@Component({
  selector: 'app-penalties-post-disclaimer',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './penalties-post-disclaimer.component.html',
  styleUrl: './penalties-post-disclaimer.component.scss'
})
export class PenaltiesPostDisclaimerComponent implements OnInit {
  userId:number;
  fineIdFromList: number;
  fine: any;
  reactiveForm:FormGroup;

  constructor(private penaltiesService: PenaltiesSanctionsServicesService,private router: Router, private route: ActivatedRoute, formBuilder:FormBuilder){
    this.userId = 1;
    this.fineIdFromList = 0; //Esto deberia venir del listado
    this.reactiveForm = formBuilder.group({
      disclaimerControl: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(800)])
    })
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.fineIdFromList = + params.get('fineId')!;
      this.getFine(this.fineIdFromList);
    });
  }

  getFine(fineId:number){
    this.penaltiesService.getFineById(this.fineIdFromList)
    .subscribe(
      (response) => {
        console.log(response); 
        this.fine = response
      },
      (error) => {
        console.error('Error:', error);
      });
  }

  onSubmit(){
    const disclaimerData = {
      userId: 10,
      fineId:this.fineIdFromList,
      disclaimer: this.reactiveForm.value.disclaimerControl
    };

    //Envio de formulario
    this.penaltiesService.addDisclaimer(disclaimerData).subscribe({
      next: (response) => {
        console.log('Reclamo enviado correctamente', response);
        this.router.navigate(['/home/sanctions/sanctionsList']);
      },
      error: (error) => {
        console.error('Error al enviar el reclamo', error);
      }
    });
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

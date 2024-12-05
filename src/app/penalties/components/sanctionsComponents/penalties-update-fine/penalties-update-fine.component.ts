import { Component, OnDestroy, OnInit } from '@angular/core';
import { SanctionService } from '../../../services/sanctions.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RoutingService } from '../../../../common/services/routing.service';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';
@Component({
  selector: 'app-penalties-update-fine',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './penalties-update-fine.component.html',
  styleUrl: './penalties-update-fine.component.scss'
})
export class PenaltiesUpdateFineComponent implements OnInit, OnDestroy {
  //Variables
  userId: number;
  fineIdFromList: number;
  fine: any;
  reactiveForm: FormGroup;

  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;


  //Constructor
  constructor(private penaltiesService: SanctionService,
    private route: ActivatedRoute,
    formBuilder: FormBuilder,
    private routingService: RoutingService,
    private tutorialService: TutorialService
  ) {
    this.userId = 1;
    this.fineIdFromList = 0; //Esto deberia venir del listado
    this.reactiveForm = formBuilder.group({
      amountControl: new FormControl('', [Validators.required, Validators.min(1), Validators.max(999999)])
    })

    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        arrow: false,
        canClickTarget: false,
        modalOverlayOpeningPadding: 10,
        modalOverlayOpeningRadius: 10,
        scrollTo: {
          behavior: 'smooth',
          block: 'center'
        }
      },
      keyboardNavigation: false,

      useModalOverlay: true,
    });
  }


  //Init
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.fineIdFromList = + params.get('fineId')!;
      this.getFine(this.fineIdFromList);
    });

    //TUTORIAL
    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
  }

  ngOnDestroy(): void {
    //TUTORIAL
    this.tutorialSubscription.unsubscribe();
    if (this.tour) {
      this.tour.complete();
    }

    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }


  //Consulta los datos de la multa desde la api
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


  //Envia un update con los datos de la multa
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

  //Cancela el update de la multa
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

  startTutorial() {
    if (this.tour) {
      this.tour.complete();
    }

    // CÓDIGO PARA PREVENIR SCROLLEO DURANTE TUTORIAL
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    const restoreScroll = () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };

    // Al empezar, lo desactiva
    this.tour.on('start', () => {
      document.body.style.overflow = 'hidden';
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });
    });

    // Al completar lo reactiva, al igual que al cancelar
    this.tour.on('complete', restoreScroll);
    this.tour.on('cancel', restoreScroll);
    
    this.tour.addStep({
      id: 'table-step',
      title: 'Actualizacion de multa',
      text: 'Acá puede actualizar una multa ya creada para modificar el monto a cobrar antes de la siguiente generacion de cobro de expensas.',
      attachTo: {
        element: '#page',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Siguiente',
          action: this.tour.next,
        }
      ]
    });

    this.tour.addStep({
      id: 'subject-step',
      title: 'Importe',
      text: 'Aqui puede actualizar el monto que se cobrara al infractor con el siguiente cobro de expensas.',
      attachTo: {
        element: '#amount',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        }
      ]
    });

    this.tour.addStep({
      id: 'subject-step',
      title: 'Boton de Guardar',
      text: 'Con este boton esta confirmando la actualizacion. Se guardaran los cambios y actualizaran instantaneamente.',
      attachTo: {
        element: '#saveButton',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Finalizar',
          action: this.tour.complete
        }
      ]
    });

    this.tour.start();
  }
}

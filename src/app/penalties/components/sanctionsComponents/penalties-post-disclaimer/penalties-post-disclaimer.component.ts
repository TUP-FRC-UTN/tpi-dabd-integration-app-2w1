import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SanctionService } from '../../../services/sanctions.service';
import Swal from 'sweetalert2';
import { RoutingService } from '../../../../common/services/routing.service';
import { PlotService } from '../../../../users/users-servicies/plot.service';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

@Component({
  selector: 'app-penalties-post-disclaimer',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './penalties-post-disclaimer.component.html',
  styleUrl: './penalties-post-disclaimer.component.scss'
})
export class PenaltiesPostDisclaimerComponent implements OnInit, OnDestroy {
  private readonly plotService = inject(PlotService);
  userId: number;
  fineIdFromList: number;
  fine: any;
  reactiveForm: FormGroup;

  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  constructor(private penaltiesService: SanctionService,
    private router: Router,
    private route: ActivatedRoute,
    formBuilder: FormBuilder,
    private routingService: RoutingService,
    private tutorialService: TutorialService
  ) {
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
      title: 'Alta de Descargo',
      text: 'Acá puede realizar el alta de un descargo. Complete el campo con el motivo de su descargo para que sea posteriormente revisado por la administracion.',
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
      title: 'Datos de la Multa',
      text: 'Aqui puede revisar los datos relacionados a la multa sobre la que esta queriendo apelar.',
      attachTo: {
        element: '#sanctionData',
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
      title: 'Boton de registro',
      text: 'Con este boton esta confirmando el alta del descargo, poseriormente se enviara a administracion para que sea revisado y se actualizara en un maximo de 7 dias el resultado.',
      attachTo: {
        element: '#sendButton',
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

  getFine(fineId: number) {
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

  onSubmit() {
    const disclaimerData = {
      userId: 10,
      fineId: this.fineIdFromList,
      disclaimer: this.reactiveForm.value.disclaimerControl
    };
    console.log(disclaimerData)

    // Confirmación antes de enviar el formulario

    this.penaltiesService.addDisclaimer(disclaimerData).subscribe(res => {
      // Notifica la apelacion al responsable de multas
      this.createNotificationMessage();

      Swal.fire({
        title: '¡Descargo enviado!',
        text: 'El descargo ha sido enviado correctamente.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      this.routingService.redirect("main/sanctions/sanctions-list", "Listado de Infracciones")
    }, error => {
      console.error('Error al enviar el descargo', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo enviar el descargo. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    })

  }

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

  // Comunicacion con Notificaciones
  createNotificationMessage() {
    let reason = this.fine.report.reportReason
    let plotName = '';

    this.plotService.getPlotById(this.fine.report.plotId).subscribe({
      next: (data) => {
        plotName = `Bloque ${data.block_number}, Lote ${data.plot_number}`;
      },
      error: (e) => { console.log('Error al consultar getPlotById', e) }
    })
    let notificationMessage = 'La multa sobre la propiedad: ' + plotName + ' - motivo: ' + reason + ' ha sido apelada';
    this.notifyDisclaimer(notificationMessage);
  }

  notifyDisclaimer(notificationMessage: string) {
    this.penaltiesService.notifyNewDisclaimer(notificationMessage).subscribe({
      next: () => { console.log("Notificacion enviada correctamente") },
      error: (e) => {
        console.log("Error al enviar la notificacion: ", e)
      }
    });
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

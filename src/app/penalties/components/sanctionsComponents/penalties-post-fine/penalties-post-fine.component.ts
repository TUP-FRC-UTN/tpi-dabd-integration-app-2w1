import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReportDTO, plotOwner } from '../../../models/reportDTO';
import { SanctionService } from '../../../services/sanctions.service';
import Swal from 'sweetalert2';
import { RoutingService } from '../../../../common/services/routing.service';
import { PlotService } from '../../../../users/users-servicies/plot.service';
import { ReportService } from '../../../services/report.service';
import { UserService } from '../../../../users/users-servicies/user.service';
import { UserGet } from '../../../../users/users-models/users/UserGet';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';
@Component({
  selector: 'app-penalties-post-fine',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './penalties-post-fine.component.html',
  styleUrls: ['./penalties-post-fine.component.css']
})
export class PenaltiesPostFineComponent implements OnInit, OnDestroy {
  private readonly plotService = inject(PlotService);
  private readonly userService = inject(UserService);
  //Variables
  report: any
  formattedDate: any;
  infractorPlaceholder: string = 'Lote B-53';
  reactiveForm!: FormGroup;
  newFine: boolean = false;
  reportId: number = 0;

  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  @Input() reportDto: ReportDTO = {
    id: 0,
    reportState: '',
    plotId: 0,
    description: '',
    createdDate: new Date,
    baseAmount: 0,
  };


  //Constructor
  constructor(
    private fb: FormBuilder,
    private penaltiesService: SanctionService,
    private route: ActivatedRoute,
    private routingService: RoutingService,
    private reportService: ReportService,
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
  }

  //Init
  private initForm(): void {
    this.reactiveForm = this.fb.group({
      infractionType: ['warning', Validators.required],
      amount: [null, [Validators.required, Validators.min(1), Validators.max(999999)]]
    });
  }


  //Init
  ngOnInit() {
    this.setTodayDate();
    this.route.paramMap.subscribe(params => {
      this.reportId = +params.get('id')!;
      this.getReport(this.reportId);
    });
    this.initForm();

    //TUTORIAL
    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
  }

  //Destroy
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
      title: 'Alta de Sanción',
      text: 'Acá puede realizar el alta de una sanción, ya sea una multa o una advertencia. Complete los campos para dar de alta la sanción sobre el informe adjunto.',
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
      title: 'Tipo de Sanción',
      text: 'Aqui puede seleccionar la severidad de la sanción que se aplicara sobre el infractor. Si se selecciona una multa, se habilitara un campo obligatorio con el importe que se le cobrara al infractor',
      attachTo: {
        element: '#sanctionType',
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
      text: 'Con este boton esta confirmando el alta de la sanción. Se notificara instantaneamente al infractor y se cerrara el informe.',
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


  //Obtiene los datos del informe consultando con la api
  getReport(reportId: number) {
    this.penaltiesService.getById(reportId).subscribe(
      (response) => {
        this.report = response;
        const createdDate = this.report?.createdDate;
        this.formattedDate = new Date(createdDate).toISOString().split('T')[0];

        this.plotService.getPlotById(this.report.plotId).subscribe(
          (plot) => {
            this.infractorPlaceholder = `Bloque ${plot.block_number}, Lote ${plot.plot_number}`;
          },
          (error) => {
            console.error('Error al obtener los datos del plot:', error);
          }
        );
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }


  //Actualiza formattedDate a la fecha actual
  setTodayDate() {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    this.formattedDate = `${year}-${month}-${day}`;
  }


  //Actualiza el estado del formulario para mostrar o no el importe
  showAmountToPay(radioButton: string) {
    this.newFine = (radioButton === 'fine');
    if (this.newFine) {
      this.reactiveForm.get('amount')?.setValue(this.report.reportReason.baseAmount);
    }
  }


  //Realiza el cargo del formulario
  onSubmit(): void {
    if (this.reactiveForm.valid) {
      if (this.reactiveForm.get('infractionType')?.value === 'fine') {
        const fineData = {
          reportId: this.reportId,
          amount: this.reactiveForm.get('amount')?.value,
          createdUser: 1
        };

        this.penaltiesService.postFine(fineData).subscribe(
          res => {
            let ownersIds: number[] = this.getOwnersIdByPlotId(this.report.plotId)
            ownersIds.forEach(id => {
              let notification = {
                user_id: id,
                reason: this.report.reportReason.reportReason, // report => ReportReason (Entidad) => reportReason propiedad de la entidad
                amount: this.reactiveForm.get('amount')?.value,
                warning: false
              }
              this.penaltiesService.notifyNewFineOrWarning(notification).subscribe({
                next: () => { },
                error: (e) => { console.log("Error al notificar al propietario: ", e) }
              });
            });
            Swal.fire({
              title: '¡Multa enviada!',
              text: 'La multa ha sido enviada correctamente.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            const reportDto: any = {
              id: this.report.id,
              reportState: "CLOSED",
              stateReason: "Multa generada, se finaliza el proceso",
              userId: this.report.userId
            };
            this.reportService.putStateReport(reportDto).subscribe(res => {

            }, error => {
              console.error('Error al actualizar el estado', error);
            })
            this.routingService.redirect("main/sanctions/sanctions-list", "Listado de Infracciones");
          },
          error => {
            console.error('Error al actualizar la multa', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo actualizar la multa. Inténtalo de nuevo.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        );
      } else {
        const warningData = {
          reportId: this.reportId,
          createdUser: 1
        };

        this.penaltiesService.postWarning(warningData).subscribe(
          res => {
            let ownersIds: number[] = this.getOwnersIdByPlotId(this.report.plotId)
            ownersIds.forEach(id => {
              let notification = {
                user_id: id,
                reason: this.report.reportReason.reportReason, // report => ReportReason (Entidad) => reportReason propiedad de la entidad
                warning: true
              }
              this.penaltiesService.notifyNewFineOrWarning(notification).subscribe({
                next: () => { },
                error: (e) => { console.log("Error al notificar al propietario: ", e) }
              });
            });
            Swal.fire({
              title: '¡Advertencia enviada!',
              text: 'La advertencia ha sido enviada correctamente.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            this.routingService.redirect("main/sanctions/sanctions-list", "Listado de Infracciones");
          },
          error => {
            console.error('Error al enviar la advertencia: ', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo enviar la advertencia. Inténtalo de nuevo.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        );
      }
    }
  }


  //Regresa al listado de informes
  cancel() {
    this.routingService.redirect("main/sanctions/report-list", "Listado de Informes");
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

  getOwnersIdByPlotId(plotId: number): number[] {
    let ownersIds: number[] = [];
    let users: UserGet[] = [];
    this.userService.getUsersByPlotID(plotId).subscribe({
      next: (data) => { users = data },
      error: (e) => { console.log("Error al cargar usuarios: ", e) }
    });
    users.forEach((user: UserGet) => {
      if (user.roles.includes('Propietario')) {
        ownersIds.push(user.id);
      }
    });
    return ownersIds;
  }
}
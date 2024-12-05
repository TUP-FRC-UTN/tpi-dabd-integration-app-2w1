import { Component, inject, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink, Router, Routes, RouterModule } from '@angular/router';
// import { MockapiService } from '../../../services/mock/mockapi.service';
import { PostReportDTO } from '../../../models/PostReportDTO';
import { ReportReasonDto } from '../../../models/ReportReasonDTO';
import { ReportService } from '../../../services/report.service';
import { error } from 'jquery';
import { ModalComplaintsListComponent } from '../../complaintComponents/modals/penalties-list-complaints-modal/penalties-list-complaints-modal.component';
import { RoutingService } from '../../../../common/services/routing.service';
import Swal from 'sweetalert2';
import { PlotService } from '../../../../users/users-servicies/plot.service';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { PlotModel } from '../../../../users/users-models/plot/Plot';
import { CommonModule } from '@angular/common';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import { OwnerService } from '../../../../users/users-servicies/owner.service';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

@Component({
  selector: 'app-new-report',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ModalComplaintsListComponent,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    CustomSelectComponent,
  ],
  templateUrl: './penalties-post-report.component.html',
  styleUrl: './penalties-post-report.component.scss',
})
export class NewReportComponent {
  url =
    'https://my-json-server.typicode.com/405786MoroBenjamin/users-responses/plots';
  private readonly plotService = inject(PlotService);
  private readonly mockPlotService = inject(HttpClient);

  mockGetPlots(): Observable<any[]> {
    return this.mockPlotService.get<any[]>(this.url);
  }
  plot = '';
  plots: any[] = [];
  PlotsFiltered: any[] = [];
  selectedReasonId = '';
  selectedDate = '';
  dateView = '';
  textareaPlaceholder = 'Ingrese su mensaje aquí...';
  description = '';
  reportReasons: ReportReasonDto[] = [];
  complaintsList: any[] = [];
  selectedComplaints: any[] = [];
  selectedComplaintsCount = 0;

  reactiveForm: FormGroup;
  otroSelected: boolean = false;
  options: { name: string; value: any }[] = [];
  optionsplot: { name: string; value: any }[] = [];

  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  constructor(
    private reportService: ReportService,
    private router: Router,
    private routingService: RoutingService,
    private formBuilder: FormBuilder,
    private ownerService: OwnerService, 
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
    this.dateView = this.setTodayDate();

    this.reactiveForm = this.formBuilder.group({
      //Usen las validaciones que necesiten, todo lo de aca esta puesto a modo de ejemplo
      reportReason: new FormControl([], [Validators.required]),
      descriptionControl: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(800),
      ]),
      plotIds: new FormControl([]),
    });
  }

  updateSelect(data: any) {
    this.reactiveForm.get('reportReason')?.setValue(data);
  }
  updateSelectplot(data: any) {
    this.reactiveForm.get('plotIds')?.setValue(data);
  }

  setTodayDate(): string {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    this.getReportReasons();
    this.getPlots();
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
    };
    while (this.tour.steps.length > 0) {
      this.tour.removeStep(this.tour.steps[this.tour.steps.length - 1].id);
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
      id: 'general-step',
      title: 'Registrar Informe',
      text: 'Acá puede realizar el alta de un informe con sus datos correspondientes. En el mismo se puede tener ninguna, una o varias denuncias anexadas al momento de crearlo. El informe incluye la siguiente información...',
      attachTo: {
        element: '#addReportForm',
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
      id: 'reason-step',
      title: 'Motivo',
      text: 'Seleccione el motivo por el cuál se creará el informe...',
      attachTo: {
        element: '#reportReason',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Siguiente',
          action: this.tour.next
        }
      ]
      
    });

    this.tour.addStep({
      id: 'description-step',
      title: 'Descripción',
      text: 'Escriba el por qué realiza el alta del informe con ese motivo...',
      attachTo: {
        element: '#reportDescription',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Siguiente',
          action: this.tour.next
        }
      ]
      
    });

    this.tour.addStep({
      id: 'lot-step',
      title: 'Selección de Lote',
      text: 'Seleccione a qué lote/s irá dirigido el informe...',
      attachTo: {
        element: '#reportLote',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Siguiente',
          action: this.tour.next
        }
      ]
      
    });

    if (this.reactiveForm.value.plotIds.length < 2) {
      console.log('Adding complaint step');
      this.tour.addStep({
        id: 'complaint-step',
        title: 'Adjuntar Denuncias',
        text: 'Este botón abrirá una ventana donde podrá visualizar y seleccionar denuncias...',
        attachTo: {
          element: '#complaintModal',
          on: 'auto',
        },
        buttons: [
          {
            text: 'Anterior',
            action: this.tour.back,
          },
          {
            text: 'Siguiente',
            action: this.tour.next,
          },
        ],
      });
    }

    
    this.tour.addStep({
      id: 'final-step',
      title: 'Registrar',
      text: 'Finalmente, haga click en el botón verde para registrar el informe.',
      attachTo: {
        element: '#submitButton',
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

  getReportReasons(): void {
    this.reportService.getAllReportReasons().subscribe(
      (reasons: ReportReasonDto[]) => {
        reasons.forEach((reason) =>
          this.reportReasons.push({
            reportReason: reason.reportReason,
            id: reason.id,
            baseAmount: reason.baseAmount,
          })
        );
        this.options = this.reportReasons.map((opt) => ({
          name: opt.reportReason,
          value: opt.id,
        }));
      },
      (error) => {
        console.error('Error al cargar report reasons: ', error);
      }
    );
  }

  getPlots(): void {
    this.plotService.getAllPlots().subscribe(
      (plots: any[]) => {
        plots.forEach((plot) =>
          this.ownerService.getOwnerByPlotId(plot.id).subscribe(
            (owner) => {
              if (owner.length != 0) {
                this.plots.push({
                  name: `Bloque ${plot.block_number}, Lote ${plot.plot_number}`,
                  value: plot.id,
                });
                this.optionsplot = this.plots.map((opt) => ({
                  name: opt.name,
                  value: opt.value,
                }));
              }
            },
            (error) => {
              console.log('Error este prop ', error);
            }
          )
        );
      },
      (error) => {
        console.error('Error al cargar plots: ', error);
      }
    );
  }
  shouldHideButton(): boolean {
    return this.reactiveForm.value.plotIds.length > 1;
  }

  handleSelectedComplaints(selectedComplaints: any[]): void {
    console.log('Denuncias recibidas del modal:', selectedComplaints);
    this.complaintsList = selectedComplaints;
    this.selectedComplaintsCount = selectedComplaints.length;
  }

  onSubmit(): void {
    const plotId = this.plot;

    const complaintsIds =
      this.complaintsList.length > 0
        ? this.complaintsList.map((complaint) => complaint.id)
        : [];

    if (this.reactiveForm.valid) {
      let formData = this.reactiveForm.value;

      let postsApiSuccess = false;
      formData.plotIds.forEach((plotId: any) => {
        let reportDTO = {
          reportReasonId: formData.reportReason,
          plotId: plotId,
          description: formData.descriptionControl,
          complaints: complaintsIds,
        };
        this.reportService.postReport(reportDTO).subscribe({
          next: (response) => {},
          error: (error) => {
            console.error('Error al enviar la denuncia', error);
          },
        });
      });

      Swal.fire({
        title: '¡Informe creado!',
        text: 'El informe ha sido creado correctamente.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
      this.reportService.triggerRefresh();
      this.routingService.redirect(
        'main/sanctions/report-list',
        'Listado de Informes'
      );
    } else {
      console.log('Los campos no estaban validados');
    }
  }

  cancel() {
    this.routingService.redirect(
      'main/sanctions/report-list/',
      'Listado de Informes'
    );
  }

  openSelectComplaints(): void {
    const modalElement = document.getElementById('complaintModal') as HTMLElement;
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  //
  onValidate(controlName: string) {
    const control = this.reactiveForm.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid,
    };
  }

  show() {
    console.log('Formulario:', this.reactiveForm.value);
  }

  //
  showError(controlName: string): string {
    const control = this.reactiveForm.get(controlName);

    if (
      control?.errors &&
      control.invalid &&
      (control.dirty || control.touched)
    ) {
      const errorKey = Object.keys(control.errors)[0];
      return this.getErrorMessage(errorKey, control.errors[errorKey]);
    }
    return '';
  }

  private getErrorMessage(errorKey: string, errorValue: any): string {
    const errorMessages: { [key: string]: (error: any) => string } = {
      required: () => 'Este campo no puede estar vacío.',
      email: () => 'Formato de correo electrónico inválido.',
      minlength: (error) =>
        `El valor ingresado es demasiado corto. Mínimo ${error.requiredLength} caracteres.`,
      maxlength: (error) =>
        `El valor ingresado es demasiado largo. Máximo ${error.requiredLength} caracteres.`,
      pattern: () => 'El formato ingresado no es válido.',
      min: (error) =>
        `El valor es menor que el mínimo permitido (${error.min}).`,
      max: (error) =>
        `El valor es mayor que el máximo permitido (${error.max}).`,
      requiredTrue: () => 'Debe aceptar el campo requerido para continuar.',
      date: () => 'La fecha ingresada es inválida.',
      url: () => 'El formato de URL ingresado no es válido.',
      number: () => 'Este campo solo acepta números.',
      customError: () => 'Error personalizado: verifique el dato ingresado.',
    };

    return (
      errorMessages[errorKey]?.(errorValue) ??
      'Error no identificado en el campo.'
    );
  }
}

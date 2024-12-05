import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { PlotService } from '../../../users-servicies/plot.service';
import { PlotTypeModel } from '../../../users-models/plot/PlotType';
import { PlotStateModel } from '../../../users-models/plot/PlotState';
import { ActivatedRoute, Router } from '@angular/router';
import { PutPlot } from '../../../users-models/plot/PutPlot';
import { FileDto } from '../../../users-models/owner/FileDto';
import { FileService } from '../../../users-servicies/file.service';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import { RoutingService } from '../../../../common/services/routing.service';
import { AuthService } from '../../../users-servicies/auth.service';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

@Component({
  selector: 'app-users-update-plot',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CustomSelectComponent],
  templateUrl: './users-update-plot.component.html',
  styleUrl: './users-update-plot.component.css',
})
export class UsersUpdatePlotComponent implements OnInit, OnDestroy {
  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  private readonly plotService = inject(PlotService);
  private readonly fileService = inject(FileService);
  private readonly suscriptionService = inject(SuscriptionManagerService);
  private readonly routingService = inject(RoutingService);

  private readonly authService = inject(AuthService);
  @ViewChild('stateSelect') stateSelect!: CustomSelectComponent;
  @ViewChild('typeSelect') typeSelect!: CustomSelectComponent;

  types: any[] = [];
  states: any[] = [];
  existingFiles: File[] = [];
  existingFilesDownload: FileDto[] = [];
  files: File[] = this.existingFiles;
  formReactivo: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
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

    this.formReactivo = this.fb.group({
      plotNumber: new FormControl(0, [Validators.required, Validators.min(1)]),
      blockNumber: new FormControl(0, [Validators.required, Validators.min(1)]),
      totalArea: new FormControl(0, [Validators.required, Validators.min(1)]),
      totalBuild: new FormControl(0, [Validators.required, Validators.min(0)]),
      state: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    //TUTORIAL
    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );

    var id = Number(this.route.snapshot.paramMap.get('id')) || 0;

    if (this.authService.getActualRole() != 'SuperAdmin') {
      this.formReactivo.get('plotNumber')?.disable();
      this.formReactivo.get('blockNumber')?.disable();
    }

    // Después de cargar los tipos y estados, encontrar el ID correcto
    const loadTypesAndStates = new Promise<void>((resolve, reject) => {
      const sus1 = this.plotService.getAllTypes().subscribe({
        next: (data: PlotTypeModel[]) => {
          this.types = data.map((d) => ({ value: d.id, name: d.name }));
        },
        error: (err) => {
          console.error('Error al cargar los tipos de lote:', err);
          reject(err);
        },
      });

      const sus2 = this.plotService.getAllStates().subscribe({
        next: (data: PlotStateModel[]) => {
          this.states = data.map((d) => ({ value: d.id, name: d.name }));
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar los estados de lote:', err);
          reject(err);
        },
      });

      //Agregar suscripción
      this.suscriptionService.addSuscription(sus1);
      this.suscriptionService.addSuscription(sus2);
    });

    loadTypesAndStates
      .then(() => {
        // Obtener el lote por su ID
        const sus = this.plotService.getPlotById(id).subscribe({
          next: (response) => {
            this.formReactivo.get('plotNumber')?.setValue(response.plot_number);
            this.formReactivo
              .get('blockNumber')
              ?.setValue(response.block_number);
            this.formReactivo
              .get('totalArea')
              ?.setValue(response.total_area_in_m2);
            this.formReactivo
              .get('totalBuild')
              ?.setValue(response.built_area_in_m2);
            this.states.forEach((state) => {
              if (state.name === response.plot_state) {
                this.formReactivo.get('state')?.setValue(state.value);
                this.stateSelect.setData(state.value as any);
              }
            });

            this.types.forEach((type) => {
              if (type.name === response.plot_type) {
                this.formReactivo.get('type')?.setValue(type.value);
                this.typeSelect.setData(type.value as any);
              }
            });

            // Guardar el valor del nombre del estado y tipo para luego asignar el ID
            const plotStateName = response.plot_state;
            const plotTypeName = response.plot_type;

            if (response.files.length > 0) {
              this.existingFilesDownload = response.files;
            }

            if (response.files && response.files.length > 0) {
              for (const fileDto of response.files) {
                this.fileService.getFile(fileDto.uuid).subscribe(
                  ({ blob, filename }) => {
                    // Crear un nuevo objeto File a partir del Blob
                    const newFile = new File([blob], filename, {
                      type: blob.type,
                    });
                    this.existingFiles.push(newFile);
                  },
                  (error) => {
                    console.error(
                      `Error al descargar el archivo ${fileDto.uuid}, error`
                    );
                  }
                );
                console.log('Files list after loading: ', this.existingFiles);
              }
            }
          },
          error: (error) => {
            console.error('Error al obtener el lote:', error);
          },
        });
        //Agregar suscripción
        this.suscriptionService.addSuscription(sus);
      })
      .catch((err) => {
        console.error('Error al cargar tipos y estados:', err);
      });

    // Obtener el lote por su ID
    const sus = this.plotService.getPlotById(id).subscribe({
      next: (response) => {
        this.formReactivo.get('plotNumber')?.setValue(response.plot_number);
        this.formReactivo.get('blockNumber')?.setValue(response.block_number);
        this.formReactivo.get('totalArea')?.setValue(response.total_area_in_m2);
        this.formReactivo
          .get('totalBuild')
          ?.setValue(response.built_area_in_m2);
        this.states.forEach((state) => {
          if (state.name === response.plot_state) {
            this.formReactivo.get('state')?.setValue(state.value);
            this.stateSelect.setData(state.value as any);
          }
        });

        this.types.forEach((type) => {
          if (type.name === response.plot_type) {
            this.formReactivo.get('type')?.setValue(type.value);
            this.typeSelect.setData(type.value as any);
          }
        });

        // subscribirse a los cambios del form reactivo state changes

        // Guardar el valor del nombre del estado y tipo para luego asignar el ID
        const plotStateName = response.plot_state;
        const plotTypeName = response.plot_type;

        if (response.files.length > 0) {
          this.existingFilesDownload = response.files;
        }

        if (response.files && response.files.length > 0) {
          for (const fileDto of response.files) {
            this.fileService.getFile(fileDto.uuid).subscribe(
              ({ blob, filename }) => {
                // Crear un nuevo objeto File a partir del Blob
                const newFile = new File([blob], filename, { type: blob.type });
                this.existingFiles.push(newFile);
              },
              (error) => {
                console.error(
                  `Error al descargar el archivo ${fileDto.uuid}, error`
                );
              }
            );
            console.log('Files list after loading: ', this.existingFiles);
          }
        }
      },
      error: (error) => {
        console.error('Error al obtener el lote:', error);
      },
    });
    //Agregar suscripción
    this.suscriptionService.addSuscription(sus);
  }

  //Desuscribirse de todas los observables
  ngOnDestroy(): void {
    this.suscriptionService.unsubscribeAll();

    //TUTORIAL
    this.tutorialSubscription.unsubscribe();
    if (this.tour) {
      this.tour.complete();
    }

    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }

  //TUTORIAL
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
      title: 'Editar lote',
      text: 'Desde acá puede realizar cambios en los datos del lote.',
      attachTo: {
        element: '#editPlot',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });



    this.tour.addStep({
      id: 'subject-step',
      title: 'Añadir archivos',
      text: 'Acá puede subir los archivos relevantes al lote. Recomendamos mantener un registro completo y actualizado de estos archivos.',
      attachTo: {
        element: '#files',
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

    this.tour.addStep({
      id: 'subject-step',
      title: 'Envio de formulario',
      text: 'Al finalizar, presione este botón para registrar los cambios.',
      attachTo: {
        element: '#register',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Finalizar',
          action: this.tour.complete,
        },
      ],
    });

    this.tour.start();
  }

  //Modificar lote
  updatePlot() {
    var id = Number(this.route.snapshot.paramMap.get('id')) || 0;
    const plot: PutPlot = {
      plot_number: this.formReactivo.get('plotNumber')?.value || 0,
      block_number: this.formReactivo.get('blockNumber')?.value || 0,
      total_area_in_m2: this.formReactivo.get('totalArea')?.value || 0,
      built_area_in_m2: this.formReactivo.get('totalBuild')?.value || 0,
      plot_state_id: Number(this.formReactivo.get('state')?.value) || 0,
      plot_type_id: Number(this.formReactivo.get('type')?.value) || 0,
      userUpdateId: 1,
      files: this.files,
    };

    const sus = this.plotService.putPlot(id, plot).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Se han guardado los cambios',
          showConfirmButton: true,
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          allowEscapeKey: false,
          timer: undefined,
        });

        //Redirigir a la lista de lotes
        this.redirect();
      },
      error: (error) => {
        console.log('Error al actualizar el lote' + error);

        Swal.fire({
          icon: 'error',
          title: 'Ha ocurrido un error',
          showConfirmButton: true,
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          allowEscapeKey: false,
          timer: undefined,
        });
      },
    });

    //Agregar suscripción
    this.suscriptionService.addSuscription(sus);
  }

  //--------------------------------------------------Validaciones--------------------------------------------------

  //Retorna una clase para poner el input en verde o rojo dependiendo si esta validado
  onValidate(controlName: string) {
    const control = this.formReactivo.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid,
    };
  }

  //Muestra el mensaje de error personalizado
  showError(controlName: string): string {
    const control = this.formReactivo.get(controlName);

    //Ver si el control existe y si tiene errores
    if (control && control.errors) {
      const [errorKey] = Object.keys(control.errors);

      switch (errorKey) {
        case 'required':
          return 'Este campo no puede estar vacío.';
        case 'min':
          return `El valor debe ser mayor o igual a ${control.errors['min'].min}.`;
        case 'email':
          return 'Formato de correo electrónico inválido.';
        case 'minlength':
          return `El valor ingresado es demasiado corto. Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `El valor ingresado es demasiado largo. Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
        case 'pattern':
          return 'El formato ingresado no es válido.';
        case 'requiredTrue':
          return 'Debe aceptar el campo requerido para continuar.';
        default:
          return 'Error no identificado en el campo.';
      }
    }

    //Si no hay errores
    return '';
  }

  //--------------------------------------------------Archivos------------------------------------------------

  //Obtener los archivos seleccionados
  getFiles(files: File[]) {
    this.files = files;
  }

  //Evento para actualizar el listado de files a los seleccionados actualmente
  onFileChange(event: any) {
    this.files = Array.from((FileList = event.target.files)); //Convertir FileList a Array
  }

  //Descargar archivo
  downloadFile(fileId: string) {
    this.fileService.getFile(fileId).subscribe(
      ({ blob, filename }) => {
        //Crear una URL desde el Blob
        const url = window.URL.createObjectURL(blob);

        //Crear un enlace de descarga dinámico
        const a = document.createElement('a');
        a.href = url;
        a.download = filename; //Nombre del archivo obtenido desde el encabezado
        document.body.appendChild(a);
        a.click(); //Simular el clic para descargar el archivo

        //Limpiar el DOM y liberar el Blob después de la descarga
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      (error) => {
        console.error('Error al descargar el archivo', error);
      }
    );
  }

  //--------------------------------------------------Redirecciones------------------------------------------------

  //Redireccionar a la lista de lotes
  redirect() {
    this.routingService.redirect('main/plots/list', 'Listado de Lotes');
  }
}

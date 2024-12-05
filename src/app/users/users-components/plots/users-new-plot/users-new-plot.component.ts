import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { PlotService } from '../../../users-servicies/plot.service';
import { PlotTypeModel } from '../../../users-models/plot/PlotType';
import { PlotStateModel } from '../../../users-models/plot/PlotState';
import { PlotModel } from '../../../users-models/plot/Plot';
import { AuthService } from '../../../users-servicies/auth.service';
import { Router } from '@angular/router';
import { ValidatorsService } from '../../../users-servicies/validators.service';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import { RoutingService } from '../../../../common/services/routing.service';
import { min } from 'moment';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

@Component({
  selector: 'app-users-new-plot',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CustomSelectComponent],
  templateUrl: './users-new-plot.component.html',
  styleUrl: './users-new-plot.component.css'
})
export class UsersNewPlotComponent implements OnInit, OnDestroy {
  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  showOwners: boolean = false;

  toggleShowOwners(event: any): void {
    this.showOwners = event.target.checked;
  }

  private readonly plotService = inject(PlotService);
  private readonly authService = inject(AuthService);
  private readonly routingService = inject(RoutingService);
  private readonly validatorService = inject(ValidatorsService);
  private readonly suscriptionService = inject(SuscriptionManagerService);

  types: any[] = [];
  states: any[] = [];
  files: File[] = [];
  formReactivo: FormGroup;

  constructor(private fb: FormBuilder, private tutorialService: TutorialService
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
      plotNumber: new FormControl(1, [
        Validators.required, Validators.min(1),
      ],
        this.validatorService.validateUniquePlotNumber()
      ),
      blockNumber: new FormControl(1, [
        Validators.required,
        Validators.min(1)
      ]),
      totalArea: new FormControl(0, [
        Validators.required,
        Validators.min(1)
      ]),
      totalBuild: new FormControl(0, [
        Validators.required,
        Validators.min(0)
      ]),
      state: new FormControl("", [
        Validators.required
      ]),
      type: new FormControl("", [
        Validators.required
      ])
    })

    //Validar que la superficie construida no sea mayor a la superficie total, cuando se cambia la superficie construida
    const sus = this.formReactivo.get('totalBuild')?.valueChanges.subscribe(() => {
      this.formReactivo.get('totalBuild')?.setValidators([Validators.max(this.formReactivo.get('totalArea')?.value), Validators.min(0)]);
    });

    const sus2 = this.formReactivo.get('totalArea')?.valueChanges.subscribe(() => {
      this.formReactivo.get('totalBuild')?.setValidators([Validators.max(this.formReactivo.get('totalArea')?.value), Validators.min(0)]);
    });

    const sus3 = this.formReactivo.get('type')?.valueChanges.subscribe(() => {
        if(this.formReactivo.get('type')?.value == 3){
          this.formReactivo.get('totalBuild')?.setValue(0);
          this.formReactivo.get('totalBuild')?.disable();
        }else{
          this.formReactivo.get('totalBuild')?.enable();
        }
    });
    
    //Agregar suscripción
    [sus, sus2, sus3].forEach(s => s && this.suscriptionService.addSuscription(s));

  }

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllTypes();

      //TUTORIAL
      this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
        () => {
          this.startTutorial();
        }
      ); 
  
  }
 

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
      title: 'Alta de lote',
      text: 'Acá puede realizar la alta de un nuevo lote. Recuerde agregar todos los campos necesarios, procurando no equivocarse en ninguno.',
      attachTo: {
        element: '#addPlot',
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
      text: 'Acá puede subir archivos relevantes al lote, como documentos o imágenes relacionadas.',
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
      text: 'Al finalizar, presione este botón para registrar el nuevo lote.',
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
  //--------------------------------------------------Carga de datos--------------------------------------------------

  //Cargar todos los estados de lote
  loadAllStates() {
    const sus = this.plotService.getAllStates().subscribe({
      next: (data: PlotStateModel[]) => {
        console.log(data);
        
        this.states = data.map(d => ({value: d.id, name: d.name}));
      },
      error: (err) => {
        console.error('Error al cargar los estados de lote:', err);
      }
    });

    //Agregar suscripción
    this.suscriptionService.addSuscription(sus);
  }

  loadAllTypes() {
    const sus = this.plotService.getAllTypes().subscribe({
      next: (data: PlotTypeModel[]) => {
        console.log(data);
        this.types = data.map(d => ({value: d.id, name: d.name}));
        console.log(this.types);
        
      },
      error: (err) => {
        console.error('Error al cargar los estados de lote:', err);
      }
    });

    //Agregar suscripción
    this.suscriptionService.addSuscription(sus);
  }
  //--------------------------------------------------Formulario--------------------------------------------------

  //Crear un lote
  createPlot() {
    if (this.formReactivo.valid) {
      const plot: PlotModel = {
        plot_number: this.formReactivo.get('plotNumber')?.value || 0,
        block_number: this.formReactivo.get('blockNumber')?.value || 0,
        total_area_in_m2: this.formReactivo.get('totalArea')?.value || 0,
        built_area_in_m2: this.formReactivo.get('totalBuild')?.value || 0,
        plot_state_id: Number(this.formReactivo.get('state')?.value || 0),
        plot_type_id: Number(this.formReactivo.get('type')?.value || 0),
        userCreateId: this.authService.getUser().id || 0,
        files: this.files
      }

      const sus = this.plotService.postPlot(plot).subscribe({
        next: () => {
          Swal.fire({
            icon: "success",
            title: "Lote guardado",
            showConfirmButton: true,
            confirmButtonText: "Aceptar",
            timer: undefined,
            allowEscapeKey: false,
            allowOutsideClick: false

          });
          this.resetForm();
          this.ngOnInit();

          //Redirigir al listado
          this.redirect();
        },
        error: (error) => {
          console.error('Error al crear el lote:', error);
        }
      });

      //Agregar suscripción
      this.suscriptionService.addSuscription(sus);
    }
  }

  //Resetear formulario
  resetForm() {
    this.formReactivo.reset();
    this.states = [];
    this.types = [];
    this.clearFileInput();
  }

  //--------------------------------------------------Validaciones------------------------------------------------

  //Validar el control
  onValidate(controlName: string) {
    const control = this.formReactivo.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }

  //Muestra el mensaje de error personalizado
  showError(controlName: string): string {
    const control = this.formReactivo.get(controlName);
    if (!control || !control.errors) return '';

    const firstErrorKey = Object.keys(control.errors)[0];
    const errorDetails = control.errors[firstErrorKey];

    switch (firstErrorKey) {
      case 'required':
        return 'Este campo no puede estar vacío.';
      case 'email':
        return 'Formato de correo electrónico inválido.';
      case 'minlength':
        return `Mínimo ${errorDetails.requiredLength} caracteres.`;
      case 'maxlength':
        return `Máximo ${errorDetails.requiredLength} caracteres.`;
      case 'pattern':
        return 'El formato ingresado no es válido.';
      case 'plotNumberTaken':
        return 'El numero de lote ya está asignado a un lote'
      case 'min':
        return `El valor debe ser mayor o igual a ${errorDetails.min}.`;
      case 'max':
        return `El terreno construido no puede ser mayor al terreno total.`;
      case 'requiredTrue':
        return 'Debe aceptar el campo requerido para continuar.';
      case 'date':
        return 'La fecha ingresada es inválida.';
      case 'url':
        return 'Formato de URL inválido.';
      case 'number':
        return 'Este campo solo acepta números.';
      case 'customError':
        return 'Error personalizado: verifique el dato ingresado.';
      default:
        return 'Error no identificado en el campo.';
    }
  }

  //--------------------------------------------------Archivos------------------------------------------------

  //Obtener los archivos
  getFiles(files: File[]) {
    this.files = files;
  }

  //Limpia el array de archivos
  clearFileInput() {
    this.files = [];
    // Limpia el input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  //Evento para actualizar el listado de files a los seleccionados actualmente
  onFileChange(event: any) {
    this.files.push(...Array.from(event.target.files as FileList)); //Convertir FileList a Array
  }

  //Eliminar un archivo
  deleteFile(index: number) {
    //Elimina el archivo del array de archivos
    this.files.splice(index, 1);

    //Limpia el valor del input de archivo
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  //--------------------------------------------------Redireccionar------------------------------------------------

  //Redireccionar
  redirect() {
    this.routingService.redirect('/main/plots/list', 'Listado de lotes');
  }


}
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OwnerService } from '../../../users-servicies/owner.service';
import { Owner } from '../../../users-models/owner/Owner';
import Swal from 'sweetalert2';
import { PutOwnerDto } from '../../../users-models/owner/PutOwnerDto';
import { FileService } from '../../../users-servicies/file.service';
import { FileDto } from '../../../users-models/owner/FileDto';
import { OwnerPlotUserDto, PlotDtoForOwner } from '../../../users-models/owner/OwnerPlotUserDto';
import { OwnerTypeModel } from '../../../users-models/owner/OwnerType';
import { OwnerStateModel } from '../../../users-models/owner/OwnerState';
import { lastValueFrom, Subscription } from 'rxjs';
import { DniTypeModel } from '../../../users-models/owner/DniTypeModel';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import { PlotService } from '../../../users-servicies/plot.service';
import { GetPlotModel } from '../../../users-models/plot/GetPlot';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';
import { RoutingService } from '../../../../common/services/routing.service';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

@Component({
  selector: 'app-users-update-owner',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CustomSelectComponent],
  templateUrl: './users-update-owner.component.html',
  styleUrl: './users-update-owner.component.css'
})
export class UsersUpdateOwnerComponent implements OnInit, OnDestroy {

  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  owner: Owner = new Owner();
  plotsForOwner: PlotDtoForOwner[] = [];
  existingFiles: File[] = [];
  files: File[] = [];
  existingFilesDownload: FileDto[] = [];
  id: string = "";
  types: any[] = [];
  dniTypes: DniTypeModel[] = [];
  states: any[] = [];
  stateOptions: any[] = [];
  stateSelected: string = '';
  juridicId = 2;
  plotsOptions: any[] = [];
  plots: String[] = [];
  editOwner: FormGroup;
  selectedPlots: number[] = [];
  @ViewChild('typeSelect') typeSelect!: CustomSelectComponent; 
  @ViewChild('stateSelect') stateSelect!: CustomSelectComponent; 
  @ViewChild('plotsSelect') plotsSelect!: CustomSelectComponent; 

  private readonly ownerService = inject(OwnerService)
  private readonly plotService = inject(PlotService)
  private readonly fileService = inject(FileService);
  private readonly suscriptionService = inject(SuscriptionManagerService);
  private readonly routingService = inject(RoutingService);

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private tutorialService: TutorialService
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

    this.editOwner = this.fb.group({
      name: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      lastname: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      dni: new FormControl("", [Validators.required, Validators.minLength(8), Validators.pattern(/^\d+$/)]),
      dniType: new FormControl("", [Validators.required]),
      ownerType: new FormControl("", [Validators.required]),
      bussinesName: new FormControl(""),
      birthdate: new FormControl("", [Validators.required, this.dateLessThanTodayValidator()]),
      phoneNumber: new FormControl("", [Validators.required, Validators.minLength(10), Validators.maxLength(20), Validators.pattern(/^\d+$/)]),
      email: new FormControl("", [Validators.required, Validators.email]),
      state: new FormControl(0, [Validators.required]),
      plots: new FormControl([])
    })
  }

  showFormErrors() {
    // Verificar si el formulario tiene errores generales
    if (this.editOwner.errors) {
      console.log('Errores del formulario:', this.editOwner.errors);
    }
  
    // Recorrer todos los controles del formulario
    Object.keys(this.editOwner.controls).forEach((controlName) => {
      const control = this.editOwner.get(controlName);
  
      // Verificar si el control tiene errores
      if (control?.errors) {
        console.log(`Errores en el control "${controlName}":`, control.errors);
      }
    });
  }

  async ngOnInit(): Promise<void> {
  //TUTORIAL
  this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
    () => {
      this.startTutorial();
    }
  ); 


    const typeControl = this.editOwner.get('ownerType');
    if (typeControl) {
      typeControl.valueChanges.subscribe(value => {
        this.toggleCompanyField(String(value ?? ""));
      });
    }
    //Obtener el id del propietario
    this.id = this.route.snapshot.paramMap.get('id') || '';

    try {
      //Esperar a que se cargue el propietario
      const data: OwnerPlotUserDto = await lastValueFrom(this.ownerService.getByIdWithUser(Number(this.id)));
      this.types = await this.loadAllTypesOwner();
      this.states = await this.loadAllStates();
      this.owner = data.owner;
      this.plotsForOwner = data.plot;
      this.plotsOptions = await this.loadAllPlots();

      this.editOwner.get('state')?.valueChanges.subscribe((value) => {
        console.log( value);
        
      });

      this.types.forEach((type) => {
        if (type.name === this.owner.ownerType) {          
          this.editOwner.get('ownerType')?.setValue(type.value);
          this.typeSelect.setData(type.value as any);
        }
      });

      this.states.forEach((state) => {
        if (state.name === this.owner.taxStatus) {          
          this.editOwner.get('state')?.setValue(state.value);
          this.stateSelect.setData(state.value as any);
        }
      });

      this.editOwner.get('plots')?.setValue(this.selectedPlots);
      this.plotsSelect.setData(this.selectedPlots);


      //Rellenar los campos del formulario con los datos del propietario
      this.editOwner.patchValue({
        name: this.owner.name,
        lastname: this.owner.lastname,
        dni: this.owner.dni,
        dniType: this.owner.dni_type,//Valor inicial para taxStatus
        bussinesName: this.owner.businessName,
        phoneNumber: data.user.phone_number,
        email: data.user.email,
        plots: data.user.plot_id
      });

      //Manejo de archivos, si existen
      if (this.owner.files?.length) {
        this.owner.files.forEach((fileDto) => {
          this.fileService.getFile(fileDto.uuid).subscribe(
            ({ blob, filename }) => {
              const newFile = new File([blob], filename, { type: blob.type });
              this.existingFiles.push(newFile);
            },
            (error) => {
              console.error(`Error al descargar el archivo ${fileDto.uuid}`, error);
            }
          );
        });
      }

      //Formateo de la fecha de nacimiento
      const formattedDate = this.parseDateString(this.owner.dateBirth);
      this.editOwner.patchValue({
        birthdate: formattedDate ? this.formatDate(formattedDate) : ''
      });

    } catch (error) {
      console.error('Error al cargar el propietario:', error);
    }

    this.getPlotsByOwnerId(Number(this.id));
    this.loadAllDniTypes();

    this.editOwner.get('dni')?.disable();
    this.editOwner.get('dniType')?.disable();
    this.editOwner.get('email')?.disable();
    this.editOwner.get('birthdate')?.disable();
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
      title: 'Editar propietario',
      text: 'Desde acá puede realizar cambios en los datos del propietario. Tenga en cuenta que algunos campos no pueden ser editados.',
      attachTo: {
        element: '#newOwner',
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
      title: 'Selección de lotes',
      text: 'Acá puede seleccionar los lotes que le corresponden al propietario.', 
      attachTo: {
        element: '#lotes',
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
      title: 'Añadir archivos',
      text: 'Acá puede subir los archivos necesarios para la certificación del propietario, o dar de baja los que ya no se necesitan.',
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

  //Desuscribirse de todos los observables
  ngOnDestroy(): void {
    this.suscriptionService.unsubscribeAll();

    this.tutorialSubscription.unsubscribe();
    if (this.tour) {
      this.tour.complete();
    }

    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }

  //--------------------------------------------------Carga de datos--------------------------------------------------

  //Obtener los terrenos de un propietario
  getPlotsByOwnerId(ownerId: number) {
    const sus = this.plotService.getPlotsByOwnerId(ownerId).subscribe({
      next: (data: GetPlotModel[]) => {
        this.plots = data.map(plot => "Lote: " + plot.plot_number + ", " + "Manzana: " + plot.block_number);
      },
      error: (err) => {
        console.error('Error al cargar los terrenos del propietario:', err);
      },
    })

    //Agregar suscripcion
    this.suscriptionService.addSuscription(sus);
  }

  //Cargar todos los estados fiscales
  async loadAllStates(): Promise<{ value: number, name: string }[]> {
    return new Promise((resolve, reject) => {
      const sus = this.ownerService.getAllStates().subscribe({
        next: (data: OwnerStateModel[]) => {
          const states = data.map(d => ({ value: d.id, name: d.description }));
          this.stateOptions = states;
          resolve(states);
        },
        error: (err) => {
          console.error('Error al cargar los estados fiscales:', err);
          reject(err);
        },
      });

      //Agregar suscripcion
      this.suscriptionService.addSuscription(sus);
    });
  }

  //Cargar todos los tipos de propietario
  async loadAllTypesOwner(): Promise<{ value: number, name: string }[]> {
    return new Promise((resolve, reject) => {
      this.ownerService.getAllTypes().subscribe({
        next: (data: OwnerTypeModel[]) => {
          const types = data.map(d => ({ value: d.id, name: d.description }));
          resolve(types);
        },
        error: (err) => {
          console.error('Error al cargar los tipos de propietario:', err);
          reject(err);
        }
      });
    });
  }

  //Cargar todos los tipos de dni
  loadAllDniTypes() {
    const sus = this.ownerService.getAllDniTypes().subscribe({
      next: (data: DniTypeModel[]) => {
        this.dniTypes = data;
        this.dniTypes.forEach((dni_type) => {
          if (dni_type.description === this.owner.dni_type) {
            this.editOwner.patchValue({
              dniType: dni_type.id.toString(),
            });
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar los estados fiscales:', err);
      },
    });

    //Agregar suscripcion
    this.suscriptionService.addSuscription(sus);
  }

  //Cargar todos los lotes
  async loadAllPlots(): Promise<{ value: number, name: string }[]> {
    return new Promise((resolve, reject) => {
      const sus = this.plotService.getAllPlots().subscribe({
        next: (data: GetPlotModel[]) => {
          // Crear las opciones del select
          let plotsAvailables: GetPlotModel[] = data.filter(plot => plot.plot_state === 'Disponible' || this.plotsForOwner.some(p => p.id === plot.id));

          this.plotsOptions = plotsAvailables.map(d => ({
            value: d.id,
            name: `Lote: ${d.plot_number}, Manzana: ${d.block_number}`
          }));

          this.selectedPlots = data
            .filter(plot => this.plotsForOwner?.some(p => p.id === plot.id))
            .map(plot => plot.id);
          


          //this.editOwner.get('plots')!.setValue(selectedPlots);
          resolve(this.plotsOptions);
        },
        error: (err) => {
          console.error('Error al cargar los terrenos:', err);
          reject(err);
        }
      });

      //Agregar suscripcion
      this.suscriptionService.addSuscription(sus);
    });
  }


  //--------------------------------------------------Funciones------------------------------------------------

  //Redirecciona al listado de propietarios
  redirect() {
    this.routingService.redirect('/main/owners/list', 'Listado de Propietarios');
  }

  //Cambiar el estado del campo de nombre de empresa
  private toggleCompanyField(ownerType: string) {
    if (ownerType === this.juridicId.toString()) {
      this.editOwner.get('bussinesName')?.enable();
    } else {
      this.editOwner.get('bussinesName')?.disable();
      this.editOwner.get('bussinesName')?.setValue(""); // Limpiar el campo si se deshabilita
    }
  }

  //Obtener los archivos seleccionados
  getFiles(files: File[]) {
    this.files = files;
  }

  // Parsea una fecha en formato "dd-MM-yyyy" a un objeto Date
  private parseDateString(dateString: string): Date | null {
    const [day, month, year] = dateString.split('-').map(Number);
    if (!day || !month || !year) {
      return null;
    }
    //Crea un objeto Date con formato "yyyy-MM-dd"
    return new Date(year, month - 1, day); // Restamos 1 al mes porque en JavaScript los meses son 0-indexed
  }

  // Formatea una fecha en "yyyy-MM-dd"
  private formatDate(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }

  //Descargar archivo
  downloadFile(fileId: string) {
    this.fileService.getFile(fileId).subscribe(({ blob, filename }) => {
      // Crear una URL desde el Blob
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace de descarga dinámico
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;  // Nombre del archivo obtenido desde el encabezado
      document.body.appendChild(a);
      a.click();  // Simular el clic para descargar el archivo

      // Limpiar el DOM y liberar el Blob después de la descarga
      window.URL.revokeObjectURL(url);
      a.remove();
    }, error => {
      console.error('Error al descargar el archivo', error);
    });
  }


  //Evento para actualizar el listado de files a los seleccionados actualmente
  onFileChange(event: any) {
    this.files.push(...Array.from(event.target.files as FileList)); //Convertir FileList a Array
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  getStatus(state: any) {
    this.stateSelected = state;
  }

  //--------------------------------------------------Acciones formulario--------------------------------------------------

  //Crear un putOwnerDto
  createObject(form: any) {
    return {
      name: form.get('name')?.value,
      lastname: form.get('lastname')?.value,
      dni: form.get('dni')?.value,
      dateBirth: form.get('birthdate')?.value,
      ownerTypeId: form.get('ownerType')?.value,
      taxStatusId: Number(form.get('state').value),
      dniTypeId: Number(form.get('dniType')?.value),
      businessName: form.get('bussinesName')?.value,
      phoneNumber: form.get('phoneNumber')?.value,
      email: form.get('email')?.value,
      files: this.files,
      userUpdateId: 1,
      active: true,
      plotId: form.get('plots')?.value,
      roles: ['Propietario']
    } as PutOwnerDto
  }

  //Confirmar salida
  confirmExit() {
    this.editOwner.reset();
    this.redirect();
  }

  //Actualizar propietario
  updateOwner(form: any) {
    if (form.valid) {
      //se crea el objeto
      let ownerPut = this.createObject(form);

      console.log(this.id);
      
      console.log(ownerPut);
      
      //llama al service
      const sus = this.ownerService.putOwner(ownerPut, Number(this.id)).subscribe({
        next: () => {
          //mostrar alerta
          Swal.fire({
            icon: "success",
            title: "Se han guardado los cambios",
            showConfirmButton: false,
            timer: 1000
          });

          this.confirmExit();
        },
        error: (error) => {
          console.log(error);

          //mostrar alerta de error
          Swal.fire({
            icon: "error",
            title: "Ha ocurrido un error",
            showConfirmButton: false,
            timer: 1000
          });
        }
      })

      //Agregar suscripcion
      this.suscriptionService.addSuscription(sus);
    }
  }

  //--------------------------------------------------Validaciones--------------------------------------------------

  //Mostrar el error con mensaje personalizado
  showError(controlName: string): string {
    const control = this.editOwner.get(controlName);

    if (!control || !control.errors) return '';

    const errorKey = Object.keys(control.errors)[0];
    const errorMessages: { [key: string]: string } = {
      required: 'Este campo no puede estar vacío.',
      email: 'Formato de correo electrónico inválido.',
      minlength: `El valor ingresado es demasiado corto. Mínimo ${control.errors['minlength']?.requiredLength} caracteres.`,
      maxlength: `El valor ingresado es demasiado largo. Máximo ${control.errors['maxlength']?.requiredLength} caracteres.`,
      pattern: 'El formato ingresado no es válido.',
      min: `El valor es menor que el mínimo permitido (${control.errors['min']?.min}).`,
      max: `El valor es mayor que el máximo permitido (${control.errors['max']?.max}).`,
      requiredTrue: 'Debe aceptar el campo requerido para continuar.',
      dateTooHigh: 'La fecha ingresada debe ser anterior al día de hoy.',
      url: 'El formato de URL ingresado no es válido.',
      number: 'Este campo solo acepta números.',
      customError: 'Error personalizado: verifique el dato ingresado.',
    };

    return errorMessages[errorKey] || 'Error no identificado en el campo.';
  }

  //Validar el control
  onValidate(controlName: string) {
    const control = this.editOwner.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }

  //Validar que la fecha sea menor al día de hoy
  dateLessThanTodayValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate >= today ? { dateTooHigh: true } : null;
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { OwnerService } from '../../../users-servicies/owner.service';
import { OwnerTypeModel } from '../../../users-models/owner/OwnerType';
import { OwnerStateModel } from '../../../users-models/owner/OwnerState';
import { UserService } from '../../../users-servicies/user.service';
import { RolModel } from '../../../users-models/users/Rol';
import { PlotService } from '../../../users-servicies/plot.service';
import { GetPlotDto } from '../../../users-models/plot/GetPlotDto';
import { OwnerModel } from '../../../users-models/owner/PostOwnerDto';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ValidatorsService } from '../../../users-servicies/validators.service';
import { AuthService } from '../../../users-servicies/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';
import { RoutingService } from '../../../../common/services/routing.service';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

@Component({
  selector: 'app-usuarios-new-owner',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule, FormsModule, CommonModule, CustomSelectComponent],
  templateUrl: './usuarios-new-owner.component.html',
  styleUrls: ['./usuarios-new-owner.component.css'] // Asegúrate de que sea styleUrls en lugar de styleUrl
})


export class UsuariosNewOwnerComponent implements OnInit, OnDestroy {

//TUTORIAL
tutorialSubscription = new Subscription();
private tour: Shepherd.Tour;

  private readonly ownerService = inject(OwnerService);
  private readonly apiService = inject(UserService);
  private readonly plotService = inject(PlotService);
  private readonly validatorService = inject(ValidatorsService);
  private readonly suscriptionService = inject(SuscriptionManagerService);
  private readonly routingService = inject(RoutingService);

  //Obtener el id del usuario logueado
  private readonly authService = inject(AuthService);

  juridicId = 2;
  date: string = new Date(2000, 0, 1).toISOString().split('T')[0];

  types: OwnerTypeModel[] = [];
  states: any[] = [];

  //Lotes disponibles (cargan el select)
  availablePlots: any[] = [];

  //Roles seleccionados
  rolesSelected: string[] = [];

  passwordVisible: boolean = false;
  files: File[] = [];

  formReactivo: FormGroup;

  roles: RolModel[] = [];
  rolesInput: string[] = [];
  select: string = "";
  documentType: string = '';

  //Inicializa el formulario
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
      name: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)]),
      lastname: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)]),
      dni: new FormControl("", [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^\d+$/),
        this.validarCuit.bind(this)
      ],
        this.validatorService.validateUniqueDni()
      ), //Tipo de documento
      documentType: new FormControl("", [
        Validators.required]),
      birthdate: new FormControl(this.date, [
        this.dateLessThanTodayValidator()]),
      email: new FormControl(null, [
        Validators.email
      ],
        this.validatorService.validateUniqueEmail()
      ),
      type: new FormControl("", [
        Validators.required]),
      username: new FormControl("", [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30)
      ],
        this.validatorService.validateUniqueUsername()
      ),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(30)]),
      rol: new FormControl(""),
      phone: new FormControl(null, [
        Validators.minLength(10),
        Validators.maxLength(20),
        Validators.pattern(/^\d+$/)]),
      company: new FormControl({ value: "", disabled: true }),
      telegram_id: new FormControl(''),
      state: new FormControl(),
      plots: new FormControl()
    })
  }

  ngOnInit(): void {
  //TUTORIAL
  this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
    () => {
      this.startTutorial();
    }
  );

    this.loadRoles();
    this.loadOwnerTypes();
    this.loadPlotStates();
    this.loadPlotsAvailables();

    const typeControl = this.formReactivo.get('type');
    if (typeControl) {
      typeControl.valueChanges.subscribe(value => {
        this.toggleCompanyField(String(value ?? ""));
      });
    }

    this.formReactivo.get('type')?.setValue("");
    // this.formReactivo.get('state')?.setValue(""); 
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
      title: 'Alta de propietario',
      text: 'Acá puede realizar la alta de un propietario. Recuerde agregar todos los campos necesarios, procurando no equivocarse en ninguno.',
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
      title: 'Tipo de propietario',
      text: 'Desde acá puede seleccionar si el propietario es una persona física o jurídica.',
      attachTo: {
        element: '#ownerType',
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
      title: 'Selección de lotes',
      text: 'Acá puede seleccionar los lotes que le corresponden al nuevo propietario.', 
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
      text: 'Acá puede subir los archivos necesarios para la certificación del propietario.',
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
      text: 'Al finalizar, presione este botón para registrar al nuevo propietario.',
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

  //Cargar los roles
  loadRoles() {
    const sus = this.apiService.getAllRoles().subscribe({
      next: (data: RolModel[]) => {
        this.roles = data;
      },
      error: (error) => {
        console.error('Error al cargar los roles:', error);
      }
    });

    //Agregar suscripcion
    this.suscriptionService.addSuscription(sus);
  }

  //Cargar los tipos de propietario
  loadOwnerTypes() {
    const sus = this.ownerService.getAllTypes().subscribe({
      next: (data: OwnerTypeModel[]) => {
        this.types = data;
      },
      error: (err) => {
        console.error('Error al cargar los tipos de propietario:', err);
      }
    });

    //Agregar suscripcion
    this.suscriptionService.addSuscription(sus);
  }

  //Cargar los estados de lote
  loadPlotStates() {
    const sus = this.ownerService.getAllStates().subscribe({
      next: (data: OwnerStateModel[]) => {
        this.states = data.map(d => ({ value: d.id, name: d.description }));
        console.log('Opciones procesadas para pasar al hijo:', this.states);
      },
      error: (err) => {
        console.error('Error al cargar los estados de lote:', err);
      }
    });

    //Agregar suscripcion
    this.suscriptionService.addSuscription(sus);
  }

  //Cargar los lotes disponibles
  loadPlotsAvailables() {
    const sus = this.plotService.getAllPlotsAvailables().subscribe({
      next: (data: GetPlotDto[]) => {

        //Se filtran los datos y se agregan como un objeto clave : valor para que puedan ser renderizados en el selectmultiple
        let dataFiltered: any[] = [];
        data.forEach(d => dataFiltered.push({ value: d.id, name: `Numero de lote: ${d.plot_number} - Manzana:${d.block_number}` }))
        this.availablePlots = dataFiltered;
      },
      error: (err) => {
        console.error('Error al cargar los lotes:', err);
      }
    });

    this.suscriptionService.addSuscription(sus);
  }

  //--------------------------------------------------Validaciones--------------------------------------------------

  //Valida que el cuit sea correcto
  validarCuit(control: AbstractControl): ValidationErrors | null {
    const cuit = control.value;

    console.log('Validando CUIT:', cuit);
    

    if (this.documentType !== '3') {
      return null;
    }

    if (!cuit || cuit.length !== 11 || !/^\d+$/.test(cuit)) {
      return { invalidCuit: 'El formato de CUIT es incorrecto' };
    }

    const base = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

    let aux = 0;
    for (let i = 0; i < 10; i++) {
      aux += parseInt(cuit[i], 10) * base[i];
    }

    aux = 11 - (aux % 11);

    if (aux === 11) {
      aux = 0;
    }
    if (aux === 10) {
      aux = 9;
    }

    return aux === parseInt(cuit[10], 10) ? null : { invalidCuit: 'El CUIT es inválido' };
  }

  documentTypeChange() {
    this.documentType = this.formReactivo.get('documentType')?.value;

    const dniControl = this.formReactivo.get('dni');

    dniControl?.setErrors(null);

    if (this.documentType === '3') {
      const validationResult = this.validarCuit(dniControl!);
      if (validationResult) {
        dniControl?.setErrors(validationResult);
      }
    }
  }

  //Valida que la fecha sea menor a la actual
  dateLessThanTodayValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate >= today ? { dateTooHigh: true } : null;
    }
  }

  //Validar el control
  onValidate(controlName: string) {
    const control = this.formReactivo.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }

  //Mostrar el error con mensaje personalizado
  showError(controlName: string): string {
    const control = this.formReactivo.get(controlName);

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
      dateLessThanToday: 'La fecha ingresada debe ser anterior al día de hoy.',
      url: 'El formato de URL ingresado no es válido.',
      number: 'Este campo solo acepta números.',
      customError: 'Error personalizado: verifique el dato ingresado.',
      usernameTaken: 'El nombre de usuario ya está en uso.',
      emailTaken: 'El correo electrónico ya está en uso.',
      dniTaken: 'El número de documento ya está en uso.',
      invalidCuit: 'El CUIT ingresado es inválido.'
    };

    return errorMessages[errorKey] || 'Error no identificado en el campo.';
  }

  //--------------------------------------------------Funciones--------------------------------------------------

  //Alternar visibilidad del campo de empresa
  private toggleCompanyField(ownerType: string) {
    if (ownerType === this.juridicId.toString()) {
      this.formReactivo.get('company')?.enable();
    } else {
      this.formReactivo.get('company')?.disable();
      this.formReactivo.get('company')?.setValue(""); // Limpiar el campo si se deshabilita
    }
  }

  //Confirmar salida
  confirmExit() {
    this.formReactivo.reset();
    this.redirect();
  }

  //Redirecciona al listado de propietarios
  redirect() {
    this.routingService.redirect('/main/owners/list', 'Listado de Propietarios');
  }

  redirectPlot(){
    this.routingService.redirect('/main/plots/add', 'Listado de Lotes');
  }

  //Cambiar visibilidad de la contraseña
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
  
  //Agregar un rol
  addRole() {
    const rolSeleccionado = this.formReactivo.get('rol')?.value;
    if (rolSeleccionado && !this.rolesInput.includes(rolSeleccionado)) {
      this.rolesInput.push(rolSeleccionado);
    }
    this.formReactivo.get('rol')?.setValue('');
  }

  //Quitar un rol
  quitRole(rol: string) {
    const index = this.rolesInput.indexOf(rol);
    if (index > -1) {
      this.rolesInput.splice(index, 1);
    }
  }

  //Obtener los archivos seleccionados
  getFiles(files: File[]) {
    this.files = files;
  }

  //Evento para actualizar el listado de files a los seleccionados actualmente
  onFileChange(event: any) {
    this.files.push(...Array.from(event.target.files as FileList)); //Convertir FileList a Array
  }

  //Eliminar archivo
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  //Limpiar los archivos
  clearFileInput() {
    this.files = [];

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  //--------------------------------------------------Acciones Formulario--------------------------------------------------

  //Resetear el formulario
  resetForm() {
    this.formReactivo.reset();
    this.clearFileInput();
    this.ngOnInit();
  }

  //Crear el propietario
  createOwner() {
    const owner: OwnerModel = {
      name: this.formReactivo.get('name')?.value || '',
      lastname: this.formReactivo.get('lastname')?.value || '',
      dni: this.formReactivo.get('dni')?.value || '',
      dni_type_id: Number(this.formReactivo.get('documentType')?.value) || 0, //Tipo de documento
      dateBirth: this.formReactivo.get('birthdate')?.value || null,
      ownerTypeId: Number(this.formReactivo.get('type')?.value || ""),
      taxStatusId: Number(this.formReactivo.get('state')?.value),
      active: true,
      username: this.formReactivo.get('username')?.value || '',
      password: this.formReactivo.get('password')?.value || '',
      email: this.formReactivo.get('email')?.value || null,
      phoneNumber: this.formReactivo.get('phone')?.value || null,
      avatarUrl: '',
      businessName: this.formReactivo.get('company')?.value || '',
      telegramId: 0,

      //--------------------------------------------------VER-----------------------------------------------------------------------------------------------------------------------
      /* estos estan hardcodeado para que ande*/
      roles: ["Propietario"],//this.rolesSelected,

      //Id del usuario logueado
      userCreateId: this.authService.getUser().id,

      //Lista de ids de los lotes seleccionados
      plotId: this.formReactivo.get('plots')?.value,

      //Archivos seleccionados
      files: this.files
    };


    //Se intenta crear el propietario
    const sus = this.ownerService.postOwner(owner).subscribe({
      next: (response) => {
        Swal.fire({
          icon: "success",
          title: "Propietario guardado",
          showConfirmButton: false,
          timer: 1460
        });

        //Agregar suscripción
        this.suscriptionService.addSuscription(sus);

        //Resetea el fomulario
        this.resetForm()
        this.redirect();
      },

      //Se intercepta el error, si sucede
      error: (error) => {
        console.error('Error al guardar el propietario:', error);
        Swal.fire({
          icon: "error",
          title: "Error al guardar los cambios",
          showConfirmButton: true,
          confirmButtonText: "Aceptar",
          allowOutsideClick: false,
          allowEscapeKey: false,
          timer: undefined,

        });
      }
    });
  }
}

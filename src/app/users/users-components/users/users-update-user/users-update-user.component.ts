import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../../users-servicies/user.service';
import { RolModel } from '../../../users-models/users/Rol';
import { UserGet } from '../../../users-models/users/UserGet';
import { UserPut } from '../../../users-models/users/UserPut';
import { Router, ActivatedRoute } from '@angular/router';
import { DateService } from '../../../users-servicies/date.service';
import { AuthService } from '../../../users-servicies/auth.service';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import { RoutingService } from '../../../../common/services/routing.service';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

@Component({
  selector: 'app-users-update-user',
  standalone: true,
  imports: [NgSelectModule, FormsModule, ReactiveFormsModule, CommonModule, CustomSelectComponent],
  templateUrl: './users-update-user.component.html',
  styleUrl: './users-update-user.component.css'
})
export class UsersUpdateUserComponent implements OnInit, OnDestroy {

  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;
  
  constructor(private route: ActivatedRoute, private fb: FormBuilder, private tutorialService: TutorialService) {
    this.updateForm = this.fb.group({
      name: new FormControl('', [Validators.required]),
      lastname: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl(null, [Validators.pattern(/^\d+$/), Validators.minLength(10), Validators.maxLength(20)]),
      telegram_id: new FormControl(0),
      dni: new FormControl('', [Validators.required, 
        Validators.pattern(/^\d+$/),
        Validators.minLength(8),
        this.validarCuit.bind(this)]),
      dniType: new FormControl(0, [Validators.required]),
      email: new FormControl(null),
      avatar_url: new FormControl(''),
      datebirth: new FormControl(null),
      roles: new FormControl([], [Validators.required])
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
  @ViewChild('rolesSelect') rolesComponent!: CustomSelectComponent; //FixMe: Usar el customSelect en este componente
  @ViewChild('dniComponent') dniComponent!: CustomSelectComponent; //FixMe: Usar el customSelect en este componente

  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly routingService = inject(RoutingService);
  private readonly suscriptionService = inject(SuscriptionManagerService);

  updateForm: FormGroup;
  rolesInput: string[] = [];
  id: string = '';
  checkRole: boolean = false;
  documentType: string = '';

  existingRoles: string[] = [];                        //Listado de todos los roles
  userRoles: string[] = [];                            //Listado de roles actuales del usuario
  filteredRoles: string[] = [];                        //Listado de roles a mostrar    
  filteredUserRoles: string[] = [];                    //Listado de roles del usuario a mostrar    
  optionRoles: { name: string, value: any }[] = [];    //Listado de objetos para el select
  blockedRoles: string[] = [];                         //Listado de roles del usuario sin mostrar
  rolesSelected: any[] = [];
  opt: any[] = [];
  checkedOpt: string[] = [];


  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || ''; // Obtiene el parámetro 'id'

    this.getAllRoles();   //Todos los roles
    this.loadUserData();  //Roles del user

    // Desactiva campos específicos del formulario
    if (this.authService.getActualRole() != 'SuperAdmin') {
      this.updateForm.get('dni')?.disable();
      this.updateForm.get('dniType')?.disable();
      this.updateForm.get('email')?.disable();
      this.updateForm.get('datebirth')?.disable();
    }

    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
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
      title: 'Actualización de usuario',
      text: 'Acá puede actualizar los datos de un usuario. Tenga en cuenta que algunos campos no pueden modificarse sin permisos especiales.',
      attachTo: {
        element: '#updateUser',
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
      title: 'Guardar cambios',
      text: 'Al finalizar, presione este botón para guardar sus cambios.',
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

  //Desuscribirse de los observables
  ngOnDestroy(): void {
    this.suscriptionService.unsubscribeAll();
    if (this.tour) {
      this.tour.complete();
    }
    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }

  //---------------------------------------------------Carga de datos---------------------------------------------------

  //Cargar todos los roles
  getAllRoles() {
    const sus = this.userService.getAllRoles().subscribe({
      next: (data: RolModel[]) => {
        this.existingRoles = data.map(rol => rol.description);
        this.filteredRoles = this.filterRoles(this.existingRoles)
        if (this.authService.getActualRole() == 'SuperAdmin') {
          // traer todos menos el rol propietario
          //data = data.filter(o => o.description != 'Propietario');

          this.optionRoles = data.map(o => ({ value: o.description, name: o.description }));
        } else {
          this.optionRoles = this.filteredRoles.map(o => ({ value: o, name: o }));
        }
      },
      error: (error) => {
        console.error('Error al cargar los roles:', error);
      }
    });

    //Agregar suscripción
    this.suscriptionService.addSuscription(sus);
  }


  //Cargar los datos del usuario
  loadUserData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const sus = this.userService.getUserById(parseInt(this.id)).subscribe({
        next: (data: UserGet) => {
          this.updateForm.get('name')?.setValue(data.name);
          this.updateForm.get('lastname')?.setValue(data.lastname);
          this.updateForm.get('dni')?.setValue(data.dni);
          this.updateForm.get('email')?.setValue(data.email || null);
          this.updateForm.get('avatar_url')?.setValue(data.avatar_url);
          console.log(data.dni_type);

          if (data.dni_type == "DNI") {
            this.updateForm.get('dniType')?.setValue(1);
          }
          else if (data.dni_type == "CUIT/CUIL") {
            this.updateForm.get('dniType')?.setValue(2);
          } else {
            this.updateForm.get('dniType')?.setValue(3);
          }
          this.dniComponent.setData(this.updateForm.get('dniType')?.value);

          this.updateForm.get('dniType')?.valueChanges.subscribe((value ) => {
            if(data.dni_type != value){
              this.updateForm.get('dni')?.setValue('');
            }
            this.documentTypeChange();
          });

            let formattedDate = null;
            if (data.datebirth) {
            formattedDate = DateService.parseDateString(data.datebirth);
            } else {
            formattedDate = null;
            }

          this.userRoles = data.roles;

          this.filteredUserRoles = this.filterUserRoles(this.userRoles);

          if (this.authService.getActualRole() != 'SuperAdmin') {
            this.updateForm.get('roles')?.setValue(this.filteredUserRoles);
            this.rolesComponent.setData(this.filteredUserRoles);
          } else {
            this.updateForm.get('roles')?.setValue(this.userRoles);
            this.rolesComponent.setData(this.userRoles);
          }

          this.updateForm.get('datebirth')?.setValue(formattedDate || null);
          if (formattedDate) {
            // Formatea la fecha a 'yyyy-MM-dd' para un input de tipo date
            const formattedDateString = formattedDate.toISOString().split('T')[0];

            this.updateForm.patchValue({
              datebirth: formattedDateString
            });
          } else {
            this.updateForm.patchValue({
              datebirth: ''
            });
          }

          this.updateForm.get('phoneNumber')?.setValue(data.phone_number.toString() || null);
          this.updateForm.get('telegram_id')?.setValue(data.telegram_id) || 0;

          // Asigna `rolesSelected` después de obtener `data.roles`


          //this.updateForm.get('roles')?.setValue([...this.filteredUserRoles])
        },
        error: (error) => {
          console.error('Error al cargar el usuario:', error);
          reject(error); // Rechaza la Promesa si hay un error
        }
      });

      //Agregar suscripción
      this.suscriptionService.addSuscription(sus);
    });
  }


  validarCuit(control: AbstractControl): ValidationErrors | null {
    const cuit = control.value;

    console.log(this.documentType);
    
    if (Number(this.documentType) !== 3) {
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
    this.documentType = this.updateForm.get('dniType')?.value;

    const dniControl = this.updateForm.get('dni');

    if (this.documentType == '3') {     
      const validationResult = this.validarCuit(dniControl!);      
      if (validationResult) {
        dniControl?.setErrors(validationResult);
      }
    }
  }

  //-----------------------------------------------------Funciones-----------------------------------------------------

  filterRoles(list: any[]) {
    let blockOptionsForOwner: string[] = ["Propietario", "SuperAdmin", "Gerente general"];
    let blockOptionsForManager: string[] = ["Propietario", "SuperAdmin", "Familiar mayor", "Familiar menor"];
    this.blockedRoles = [];

    let blockOptions: any[] = [];
    blockOptions = ((this.authService.getActualRole() == "Propietario") ? blockOptionsForOwner : blockOptionsForManager)

    const filteredList = list.filter(opt => {
      if (blockOptions.includes(opt)) {
        this.blockedRoles.push(opt);
        return false;
      }

      return true;
    });
    return filteredList;
  }

  filterUserRoles(list: any[]) {
    let blockOptionsForOwner: string[] = ["Propietario", "SuperAdmin", "Gerente general"];
    let blockOptionsForManager: string[] = ["Propietario", "SuperAdmin", "Familiar mayor", "Familiar menor"];
    this.blockedRoles = [];

    let blockOptions: any[] = [];
    blockOptions = ((this.authService.getActualRole() == "Propietario") ? blockOptionsForOwner : blockOptionsForManager)

    const filteredList = list.filter(opt => {
      if (blockOptions.includes(opt)) {
        this.blockedRoles.push(opt);
        return false;
      }
      return true;
    });
    return filteredList;
  }

  toggleSelection(item: any) {
    const index = this.rolesSelected.indexOf(item.value);
    if (index > -1) {
      // Si ya está seleccionado, lo desmarcamos
      this.rolesSelected.splice(index, 1);
    } else {
      // Si no está seleccionado, lo agregamos
      this.rolesSelected.push(item.value);
    }
  }

  updateRoles(newRoles: any) {
    this.updateForm.patchValue({
      roles: newRoles
    })
  }

  //----------------------------------------------------Formulario----------------------------------------------------

  //Actualiza el usuario
  updateUser() {
    const user: UserPut = new UserPut();
    user.name = this.updateForm.get('name')?.value || '';
    user.lastName = this.updateForm.get('lastname')?.value || '';
    user.dni = this.updateForm.get('dni')?.value || '';
    user.phoneNumber = this.updateForm.get('phoneNumber')?.value?.toString() || null;
    user.email = this.updateForm.get('email')?.value || null;
    user.avatar_url = this.updateForm.get('avatar_url')?.value || '';

    //Formatea la fecha correctamente (año-mes-día)
    const date: Date = new Date(this.updateForm.get('datebirth')?.value || null);

    //Formatear la fecha como YYYY-MM-DD
    let formattdDate = null;
    if(date){
      formattdDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
    else{
      formattdDate = null;
    }
    

    user.datebirth = formattdDate || null;
    user.roles = this.updateForm.get('roles')?.value + this.blockedRoles || [];
    user.userUpdateId = this.authService.getUser().id;
    user.dni_type_id = this.updateForm.get('dniType')?.value;

    user.roles = this.updateForm.get('roles')?.value;
    if (this.authService.getActualRole() != 'SuperAdmin') {
      user.roles.push(...this.blockedRoles);
    }

    console.log(user);


    //Llama al servicio para actualizar el usuario
    this.userService.putUser(user, parseInt(this.id)).subscribe({
      next: (response) => {
        Swal.fire({
          icon: "success",
          title: 'Usuario actualizado exitosamente'
        });
        this.redirectList();
      },
      error: (error) => {
        console.error('Error al actualizar el usuario:', error);
        Swal.fire({
          icon: "error",
          title: 'Error al actualizar el usuario'
        });
      },
    });
  }

  //-----------------------------------------------------Redirecciones-----------------------------------------------------

  //Redirige a la lista
  redirectList() {
    if (this.authService.getActualRole() === 'Propietario') {
      this.routingService.redirect('main/users/family', 'Mi familia');
    } else {

      this.routingService.redirect('main/users/list', 'Listado de Usuarios');
    }
  }

  //-----------------------------------------------------Validaciones-----------------------------------------------------

  //Retorna una clase para poner el input en verde o rojo dependiendo si esta validado
  onValidate(controlName: string) {
    const control = this.updateForm.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }

  //Muestra el mensaje de error personalizado
  showError(controlName: string): string {
    const control = this.updateForm.get(controlName);

    if (control && control.errors) {
      const errorKey = Object.keys(control.errors)[0];

      switch (errorKey) {
        case 'required':
          return 'Este campo no puede estar vacío.';
        case 'email':
          return 'Formato de correo electrónico inválido.';
        case 'minlength':
          return `El valor ingresado es demasiado corto. Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `El valor ingresado es demasiado largo. Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
        case 'min':
          return `El valor es menor que el mínimo permitido (${control.errors['min'].min}).`;
        case 'pattern':
          return 'El formato ingresado no es válido.';
        case 'requiredTrue':
          return 'Debe aceptar el campo requerido para continuar.';
        case 'date':
          return 'La fecha ingresada es inválida.';
        case 'invalidCuit':
          return 'El CUIT ingresado es inválido.';
        default:
          return 'Error no identificado en el campo.';
      }
    }
    return ''; // Retorna cadena vacía si no hay errores.
  }

  showFormErrors() {
    // Verificar si el formulario tiene errores generales
    if (this.updateForm.errors) {
      console.log('Errores del formulario:', this.updateForm.errors);
    }

    // Recorrer todos los controles del formulario
    Object.keys(this.updateForm.controls).forEach((controlName) => {
      const control = this.updateForm.get(controlName);

      // Verificar si el control tiene errores
      if (control?.errors) {
        console.log(`Errores en el control "${controlName}":`, control.errors);
      }
    });
  }
}


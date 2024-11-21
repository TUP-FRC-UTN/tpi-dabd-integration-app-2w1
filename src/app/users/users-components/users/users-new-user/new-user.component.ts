import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { RolModel } from '../../../users-models/users/Rol';
import { UserService } from '../../../users-servicies/user.service';
import { UserPost } from '../../../users-models/users/UserPost';
import { RouterModule } from '@angular/router';
import { DateService } from '../../../users-servicies/date.service';
import { AuthService } from '../../../users-servicies/auth.service';
import Swal from 'sweetalert2';
import { PlotService } from '../../../users-servicies/plot.service';
import { GetPlotDto } from '../../../users-models/plot/GetPlotDto';
import { ValidatorsService } from '../../../users-servicies/validators.service';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import { RoutingService } from '../../../../common/services/routing.service';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';

@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterModule, CustomSelectComponent],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.css'
})
export class NewUserComponent implements OnInit, OnDestroy {

  constructor(private fb: FormBuilder) {
    this.reactiveForm = this.fb.group({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50)
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50)
      ]),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30)
      ],
        this.validatorService.validateUniqueUsername()
      ),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(30)
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ],
        this.validatorService.validateUniqueEmail()
      ),
      phone_number: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(10),
        Validators.maxLength(20)
      ]),
      dniType: new FormControl(0, [
        Validators.required

      ]),
      dni: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(8)
      ],
        this.validatorService.validateUniqueDni()
      ),
      telegram_id: new FormControl(0, [
        Validators.required,
        Validators.min(0),
        Validators.minLength(1),
        Validators.maxLength(9)
      ]),
      active: new FormControl(true),
      datebirth: new FormControl(DateService.formatDate(new Date("2000-01-02")), [Validators.required]),
      roles: new FormControl([], Validators.required),
      plot: new FormControl('', [Validators.required]),
      userUpdateId: new FormControl(this.authService.getUser().id)
    })
  }

  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly plotService = inject(PlotService);
  private readonly validatorService = inject(ValidatorsService);
  private readonly routingService = inject(RoutingService);
  private readonly suscriptionService = inject(SuscriptionManagerService);
  @ViewChild(CustomSelectComponent) customSelectComponent!: CustomSelectComponent;

  reactiveForm: FormGroup;
  rolesSelected: string[] = [];
  roles: RolModel[] = [];
  rolesHtmlString: string = '';
  rolesString: string = "Roles añadidos:";
  rolesInput: string[] = [];
  select: string = "";
  checkOption: boolean = false;
  lotes: GetPlotDto[] = [];
  date: string = new Date(2000, 0, 1).toISOString().split('T')[0];
  initialDate: FormControl = new FormControl(this.date);
  subTitleLabel: string = 'Seleccione los roles del usuario';
  optionsForOwner: string[] = ["Familiar mayor", "Familiar menor"];
  options: any[] = [];
  selectedOptions: string[] = [];
  passwordVisible: boolean = false;
  actualRole = this.authService.getActualRole();

  ngOnInit() {

    this.loadRoles();
    this.loadPlotsAvailables();

    if (this.authService.getActualRole() == "Propietario") {
      this.reactiveForm.controls['plot'].disable();
    }

    this.loadFilteredRoles();

    if (this.authService.getActualRole() == "Gerente general") {
      this.reactiveForm.get("plot")?.disable();
      this.reactiveForm.get("plot")?.setValue("Sin lote");
    }
      
  }

  //Desuscribirse de los observables
  ngOnDestroy(): void {
    this.suscriptionService.unsubscribeAll();
  }

  //------------------------------------------------------Carga de datos------------------------------------------------

  //Carga los lotes disponibles
  loadPlotsAvailables() {
    const sus = this.plotService.getAllPlotsAvailables().subscribe({
      next: (data: GetPlotDto[]) => {
        if (this.authService.getActualRole() == "Propietario") {
          this.lotes = data.filter(lote => this.authService.getUser().plotId.includes(lote.id));
          this.reactiveForm.get('plot')?.setValue(this.authService.getUser().plotId.toString());
          this.reactiveForm.get('plot')?.disable();
        } else {
          this.lotes = data;
          this.reactiveForm.get('plot')?.setValue(0);
        }
      },
      error: (err) => {
        console.error('Error al cargar los lotes:', err);
      }
    });

    if(this.authService.getActualRole() == "Propietario"){
      this.reactiveForm.controls['plot'].disable();
    }


    this.userService.getAllRoles().subscribe({
      next: (data: RolModel[]) => {
        this.options = data.map(rol => rol.description);
        if(this.authService.getActualRole() == "Propietario"){
          let optionsFilter = this.options.filter(rol => !["Familiar mayor", "Familiar menor", "Inquilino"].includes(rol));
          this.options = [];          
          optionsFilter.forEach(o => this.options.push({value : o, name: o}))
                    
        }
        else if(this.authService.getActualRole() == "SuperAdmin"){
            let optionsFilter = this.options.filter(rol => !["Propietario", "Familiar mayor", "Familiar menor", "Inquilino"].includes(rol));
          this.options = [];
          optionsFilter.forEach(o => this.options.push({value : o, name: o}))
          
        }
        else if(this.authService.getActualRole() == "Gerente general"){
          let optionsFilter = this.options.filter(rol => !["SuperAdmin","Propietario", "Familiar mayor", "Familiar menor", "Inquilino"].includes(rol));
          this.options = [];
          optionsFilter.forEach(o => this.options.push({value : o, name: o}))           
        }
          else{
            let optionsFilter = this.options.filter(rol => !["Familiar mayor", "Familiar menor", "Inquilino"].includes(rol));
            this.options = [];
            optionsFilter.forEach(o => this.options.push({value : o, name: o}))
          }
        },
      error: (error) => {
        console.error('Error al cargar los roles:', error);
      }
    });

    if(this.authService.getActualRole() == "Gerente general"){
      this.reactiveForm.get("plot")?.disable();
      this.reactiveForm.get("plot")?.setValue("Sin lote");
    }
    //Agregar suscripción
    this.suscriptionService.addSuscription(sus);
  }

  //Carga los roles
  loadRoles() {
    this.userService.getAllRoles().subscribe({
      next: (data: RolModel[]) => {

        this.roles = data;
      },
      error: (error) => {
        console.error('Error al cargar los roles:', error);

      }
    });
  }

  //Carga los roles y los filtra
  loadFilteredRoles() {
    const sus = this.userService.getAllRoles().subscribe({
      next: (data: RolModel[]) => {
        this.options = data.map(rol => rol.description);
        if (this.authService.getActualRole() == "Propietario") {
          let optionsFilter = this.options.filter(rol => ["Familiar mayor", "Familiar menor", "Inquilino"].includes(rol));
          this.options = [];
          optionsFilter.forEach(o => this.options.push({ value: o, name: o }))        
        }
        else if (this.authService.getActualRole() == "SuperAdmin") {
          let optionsFilter = this.options.filter(rol => this.options.includes(rol) && rol != "Propietario");
          this.options = [];
          optionsFilter.forEach(o => this.options.push({ value: o, name: o }))

        }
        else {
          let optionsFilter = this.options.filter(rol => !this.optionsForOwner.includes(rol) && rol != "Propietario" && rol != "SuperAdmin");
          this.options = [];
          optionsFilter.forEach(o => this.options.push({ value: o, name: o }))
        }
      },
      error: (error) => {
        console.error('Error al cargar los roles:', error);
      }
    });

    //Agregar suscripción+
    this.suscriptionService.addSuscription(sus);
  }

  //------------------------------------------------------Redireccionar------------------------------------------------------

  //Redirige a la ruta especificada 
  redirect() {
    if (this.authService.getActualRole() == "Propietario") {
      this.routingService.redirect('/main/users/family', 'Mi Familia');
    } else {
      this.routingService.redirect('/main/users/list', 'Listado de Usuarios');
    }
  }

  //--------------------------------------------------------Formulario-------------------------------------------------------

  //Crear el usuario
  createUser() {

    const fechaValue = this.reactiveForm.get('datebirth')?.value;

    const userData: UserPost = {
      name: this.reactiveForm.get('name')?.value || '',
      lastname: this.reactiveForm.get('lastname')?.value || '',
      username: this.reactiveForm.get('username')?.value || '',
      password: this.reactiveForm.get('password')?.value?.toString() || '',
      email: this.reactiveForm.get('email')?.value || '',
      dni_type_id: Number(this.reactiveForm.get('dniType')?.value) || 0,
      dni: this.reactiveForm.get('dni')?.value?.toString() || "",
      active: true,
      avatar_url: "",
      datebirth: fechaValue ? new Date(fechaValue).toISOString().split('T')[0] : '',
      roles: this.reactiveForm.get('roles')?.value || [],
      phone_number: this.reactiveForm.get('phone_number')?.value?.toString() || '',
      userUpdateId: this.reactiveForm.get('userUpdateId')?.value || 0,
      telegram_id: this.reactiveForm.get('telegram_id')?.value || 0

    };

    //Si el usuario es de tipo owner se setea el plotId
    if (this.authService.getActualRole() == "Propietario") {
      userData.plot_id = this.authService.getUser().plotId[0];
    } else {
      userData.plot_id = 0;
    }

    console.log(userData);
    

    const sus = this.userService.postUser(userData).subscribe({
      next: (response) => {
        //Mostramos que la operación fue exitosa
        Swal.fire({
          title: 'Usuario creado',
          text: 'El usuario se ha creado correctamente',
          icon: 'success',
          timer: undefined,
          showConfirmButton: true,
          confirmButtonText: 'Aceptar',
        });
        this.redirect();
        this.reactiveForm.reset();

      },
      error: (error) => {
        //Mostramos que hubo un error
        Swal.fire({
          title: 'Error',
          text: 'El usuario no se pudo crear',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    });

    //Agregar suscripción
    this.suscriptionService.addSuscription(sus);
  }

  //Resetear formularios
  resetForm() {
    this.reactiveForm.reset();
    this.rolesInput = [];
  }

  //---------------------------------------------------------Funciones-------------------------------------------------------

  //Cambia la visibilidad de la contraseña
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  verifyOptions() {
    if (this.selectedOptions.length === 0) {
      this.checkOption = false;
    }
    else {
      this.checkOption = true;
    }
  }

  //----------------------------------------------------Validaciones----------------------------------------------------

  //Retorna una clase para poner el input en verde o rojo dependiendo si esta validado
  onValidate(controlName: string) {
    const control = this.reactiveForm.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }

  //Muestra el mensaje de error personalizado
  showError(controlName: string): string {
    const control = this.reactiveForm.get(controlName);

    if (control && control.errors) {
      const [errorKey] = Object.keys(control.errors);

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
        case 'usernameTaken':
          return 'Este nombre de usuario ya está en uso.';
        case 'emailTaken':
          return 'Este correo electrónico ya está en uso.';
        case 'dniTaken':
          return 'Este DNI ya está en uso.';
        default:
          return 'Error no identificado en el campo.';
      }
    }

    // Retorna cadena vacía si no hay errores.
    return '';
  }
}
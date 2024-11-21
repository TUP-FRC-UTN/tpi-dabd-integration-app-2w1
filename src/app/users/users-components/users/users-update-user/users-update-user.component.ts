import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
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

@Component({
  selector: 'app-users-update-user',
  standalone: true,
  imports: [NgSelectModule, FormsModule, ReactiveFormsModule, CommonModule, CustomSelectComponent],
  templateUrl: './users-update-user.component.html',
  styleUrl: './users-update-user.component.css'
})
export class UsersUpdateUserComponent implements OnInit, OnDestroy {
mostrarRolesSeleccionados() {
throw new Error('Method not implemented.');
}

  constructor(private route: ActivatedRoute, private fb : FormBuilder) { 
    this.updateForm = this.fb.group({
      name: new FormControl('', [Validators.required]),
      lastname: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(10), Validators.maxLength(20)]),
      telegram_id: new FormControl(0),
      dni: new FormControl(''),
      email: new FormControl('', [Validators.email]),
      avatar_url: new FormControl(''),
      datebirth: new FormControl(''),
      roles: new FormControl([], [Validators.required])
    })
  }
  @ViewChild(CustomSelectComponent) rolesComponent!: CustomSelectComponent; //FixMe: Usar el customSelect en este componente

  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly routingService = inject(RoutingService);
  private readonly suscriptionService = inject(SuscriptionManagerService);

  updateForm : FormGroup;
  rolesInput: string[] = [];
  id: string = '';
  checkRole: boolean = false;

  existingRoles: string[] = [];                       //Listado de todos los roles
  userRoles: string[] = [];                           //Listado de roles actuales del usuario
  filteredRoles : string[] = [];                      //Listado de roles a mostrar    
  filteredUserRoles : string[] = [];                  //Listado de roles del usuario a mostrar    
  optionRoles : {name: string, value: any}[] = [];    //Listado de objetos para el select
  blockedRoles: string[] = [];                        //Listado de roles del usuario sin mostrar
  rolesSelected: any[] = [];
  opt: any[] = [];
  checkedOpt: string[] = [];


  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || ''; // Obtiene el parámetro 'id'

    this.getAllRoles();   //Todos los roles
    this.loadUserData();  //Roles del user

    // Desactiva campos específicos del formulario
    if(this.authService.getActualRole() != 'SuperAdmin'){
      this.updateForm.get('dni')?.disable();
      this.updateForm.get('email')?.disable();
      this.updateForm.get('datebirth')?.disable();
    }
  }

  //Desuscribirse de los observables
  ngOnDestroy(): void {
    this.suscriptionService.unsubscribeAll();
  }

  //---------------------------------------------------Carga de datos---------------------------------------------------

  //Cargar todos los roles
  getAllRoles(){
    const sus = this.userService.getAllRoles().subscribe({
      next: (data: RolModel[]) => {
        this.existingRoles = data.map(rol => rol.description);
        this.filteredRoles = this.filterRoles(this.existingRoles)
        if(this.authService.getActualRole() == 'SuperAdmin'){
          // traer todos menos el rol propietario
          //data = data.filter(o => o.description != 'Propietario');
          
          this.optionRoles = data.map(o => ({ value: o.description, name: o.description}));
        }else{
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
          this.updateForm.get('dni')?.setValue(data.dni.toString());
          this.updateForm.get('email')?.setValue(data.email);
          this.updateForm.get('avatar_url')?.setValue(data.avatar_url);
          const formattedDate = DateService.parseDateString(data.datebirth);


          this.userRoles = data.roles;
          console.log(this.userRoles);
          
          this.filteredUserRoles = this.filterUserRoles(this.userRoles);          
          
          if(this.authService.getActualRole() != 'SuperAdmin'){
            this.updateForm.get('roles')?.setValue(this.filteredUserRoles);
            this.rolesComponent.setData(this.filteredUserRoles);
          }else{
            this.updateForm.get('roles')?.setValue(this.userRoles);     
            this.rolesComponent.setData(this.userRoles);
          }
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

          this.updateForm.get('phoneNumber')?.setValue(data.phone_number.toString());
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

  //-----------------------------------------------------Funciones-----------------------------------------------------

  filterRoles(list : any[]){
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

  filterUserRoles(list : any[]){
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
      user.phoneNumber = this.updateForm.get('phoneNumber')?.value?.toString() || '';
      user.email = this.updateForm.get('email')?.value || '';
      user.avatar_url = this.updateForm.get('avatar_url')?.value || '';
  
      //Formatea la fecha correctamente (año-mes-día)
      const date: Date = new Date(this.updateForm.get('datebirth')?.value || '');
      
      //Formatear la fecha como YYYY-MM-DD
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  
      user.datebirth = formattedDate;
      user.roles = this.updateForm.get('roles')?.value +this.blockedRoles || [];
      user.userUpdateId = this.authService.getUser().id;
      user.dni_type_id = 1;
  
      user.roles = this.updateForm.get('roles')?.value;
      if(this.authService.getActualRole() != 'SuperAdmin'){
        user.roles.push(...this.blockedRoles); 
      }
  
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


import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OwnerService } from '../../../users-servicies/owner.service';
import { OwnerTypeModel } from '../../../users-models/owner/OwnerType';
import { OwnerStateModel } from '../../../users-models/owner/OwnerState';
import { UserService } from '../../../users-servicies/user.service';
import { RolModel } from '../../../users-models/users/Rol';
import { UsersSelectMultipleComponent } from '../../utils/users-select-multiple/users-select-multiple.component';
import { PlotService } from '../../../users-servicies/plot.service';
import { GetPlotDto } from '../../../users-models/plot/GetPlotDto';
import { OwnerModel } from '../../../users-models/owner/PostOwnerDto';
import Swal from 'sweetalert2';
import { Route, Router } from '@angular/router';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FileUploadComponent } from '../../utils/file-upload/file-upload.component';

@Component({
  selector: 'app-usuarios-new-owner',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UsersSelectMultipleComponent, FileUploadComponent],
  templateUrl: './usuarios-new-owner.component.html',
  styleUrls: ['./usuarios-new-owner.component.css'] // Asegúrate de que sea styleUrls en lugar de styleUrl
})


export class UsuariosNewOwnerComponent {

  private readonly ownerService = inject(OwnerService);
  private readonly apiService = inject(UserService);
  private readonly plotService = inject(PlotService);
  JURIDICA_ID = 2;

  types: OwnerTypeModel[] = [];
  states: OwnerStateModel[] = [];
  lotes: GetPlotDto[] = [];
  rolesSelected: string[] = [];

  passwordVisible: boolean = false;
  files: File[] = [];

  constructor(private router: Router) { }

  formReactivo = new FormGroup({
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
      Validators.pattern(/^\d+$/)]), //Esto valida que sea numerico el string
    cuit_cuil: new FormControl("", [
      Validators.required,
      Validators.pattern(/^\d+$/),
      Validators.minLength(11),
      Validators.maxLength(20)]),
    birthdate: new FormControl(null, [
      Validators.required,
      this.dateLessThanTodayValidator()]),
    email: new FormControl("", [
      Validators.required,
      Validators.email]),
    state: new FormControl(null, [
      Validators.required]),
    type: new FormControl(null, [
      Validators.required]),
    username: new FormControl("", [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(30)]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(30)]),
    rol: new FormControl(""),
    plot: new FormControl(null, [
      Validators.required]),
    phone: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(20),
      Validators.pattern(/^\d+$/)]),
    //phone: new FormControl('', [Validators.required]),
    company: new FormControl({ value: "", disabled: true }),
    telegram_id: new FormControl('')
    
  });

  ngOnInit(): void {
    this.loadRoles();

    const typeControl = this.formReactivo.get('type');
    if (typeControl) {
      typeControl.valueChanges.subscribe(value => {
        this.toggleCompanyField(value ?? '');
      });
    }

    this.ownerService.getAllTypes().subscribe({
      next: (data: OwnerTypeModel[]) => {
        this.types = data;
      },
      error: (err) => {
        console.error('Error al cargar los tipos de lote:', err);
      }
    });

    this.ownerService.getAllStates().subscribe({
      next: (data: OwnerStateModel[]) => {
        this.states = data;
      },
      error: (err) => {
        console.error('Error al cargar los estados de lote:', err);
      }
    });

    //SOLO MUESTRA LOS LOTES DISPONIBLES
    this.plotService.getAllPlotsAvailables().subscribe({
      next: (data: GetPlotDto[]) => {
        this.lotes = data;
      },
      error: (err) => {
        console.error('Error al cargar los tipos de lote:', err);
      }
    });
  }

  roles: RolModel[] = [];
  rolesInput: string[] = [];
  select: string = "";

  loadRoles() {
    this.apiService.getAllRoles().subscribe({
      next: (data: RolModel[]) => {
        this.roles = data;
      },
      error: (error) => {
        console.error('Error al cargar los roles:', error);
      }
    });
  }

  dateLessThanTodayValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate >= today ? { dateTooHigh: true } : null;
    }
  }

  private toggleCompanyField(ownerType: string) {
    if (ownerType === this.JURIDICA_ID.toString()) {
      this.formReactivo.get('company')?.enable();
    } else {
      this.formReactivo.get('company')?.disable();
      this.formReactivo.get('company')?.setValue(""); // Limpiar el campo si se deshabilita
    }
  }

  formatCUIT(value: string): void {
    const cleaned = value.replace(/\D/g, ''); // Eliminar caracteres no numéricos

    if (cleaned.length < 2) {
      this.formReactivo.get('cuit_cuil')?.setValue(cleaned);
      return;
    }

    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.substring(0, 2) + '-'; // Agrega guión después de los primeros 2 dígitos
    }
    if (cleaned.length > 2) {
      formatted += cleaned.substring(2);
    }
    if (cleaned.length >= 10) {
      formatted = formatted.substring(0, 11) + '-' + cleaned.charAt(10); // Agrega guión antes del último dígito
    }

    this.formReactivo.get('cuit_cuil')?.setValue(formatted, { emitEvent: false }); // Evita el loop de eventos
  }

  confirmExit() {
    Swal.fire({
        title: '¿Seguro que desea cancelar la operación?',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc3545',
        cancelButtonText: 'Cancelar',
    }).then((result) => {
        if (result.isConfirmed) {
            this.formReactivo.reset(); 
            this.redirect('/home/owners/list'); 

            Swal.fire({
                title: 'Operación cancelada',
                icon: 'info',
                position: 'top-right', 
                showConfirmButton: false, 
                timer: 1000 
            });
        }
    });
  }
  
  redirect(path: string) {
    this.router.navigate([path]);
  }

  addRole() {
    const rolSeleccionado = this.formReactivo.get('rol')?.value;
    if (rolSeleccionado && !this.rolesInput.includes(rolSeleccionado)) {
      this.rolesInput.push(rolSeleccionado);
    }
    this.formReactivo.get('rol')?.setValue('');
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  quitRole(rol: string) {
    const index = this.rolesInput.indexOf(rol);
    if (index > -1) {
      this.rolesInput.splice(index, 1);
    }
  }

  onValidate(controlName: string) {
    const control = this.formReactivo.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }

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
    };
  
    return errorMessages[errorKey] || 'Error no identificado en el campo.';
  }

  getFiles(files: File[]) {
    this.files = files;
  }

  createOwner() {
    const owner: OwnerModel = {
      name: this.formReactivo.get('name')?.value || '',
      lastname: this.formReactivo.get('lastname')?.value || '',
      dni: this.formReactivo.get('dni')?.value || '',
      cuitCuil: this.formReactivo.get('cuit_cuil')?.value || '',
      dateBirth: this.formReactivo.get('birthdate')?.value || new Date(),
      ownerTypeId: this.formReactivo.get('type')?.value || 0,
      taxStatusId: this.formReactivo.get('state')?.value || 0,
      active: true,
      username: this.formReactivo.get('username')?.value || '',
      password: this.formReactivo.get('password')?.value || '',
      email: this.formReactivo.get('email')?.value || '',
      phoneNumber: this.formReactivo.get('phone')?.value || '',
      avatarUrl: 'nada',
      businessName: this.formReactivo.get('company')?.value || '',
     
     /* estos estan hardcodeado para que ande*/
      roles: ["Propietario"],//this.rolesSelected,
      userCreateId: 1,
      plotId: this.formReactivo.get('plot')?.value || 0,
      telegramId: 1,
      files: this.files
    };

    this.ownerService.postOwner(owner).subscribe({
      next: (response) => {
        Swal.fire({
          icon: "success",
          title: "Propietario guardado",
          showConfirmButton: false,
          timer: 1460
        });
        this.formReactivo.reset(); // Resetea el formulario después de guardar
      },
      error: (error) => {
        console.error('Error al guardar el propietario:', error);
        Swal.fire({
          icon: "error",
          title: "Error al guardar los cambios",
          showConfirmButton: false,
          timer: 1460
        });
      }
    });
  }

    //Evento para actualizar el listado de files a los seleccionados actualmente
    onFileChange(event: any) {
      this.files = Array.from(FileList = event.target.files); //Convertir FileList a Array
    }
}

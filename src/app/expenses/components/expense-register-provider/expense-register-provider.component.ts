import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../users/users-servicies/auth.service';
import { SuppliersService } from '../../../inventories/iep-inventory/services/suppliers.service';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expense-register-provider',
  templateUrl: './expense-register-provider.component.html',
  styleUrls: ['./expense-register-provider.component.css'],
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule]
})
export class ExpenseRegisterProviderComponent implements OnInit {

  @Output() eventSucces = new EventEmitter<void>();
  @Output() eventError = new EventEmitter<string>();
  constructor(private modal: NgbActiveModal,private fb: FormBuilder,private supplierService: SuppliersService, private userService: AuthService) { }
  proveedorForm!: FormGroup;
  ngOnInit():void {
    this.proveedorForm = this.fb.group({
      name: ['', Validators.required],
      cuit: ['', [
        Validators.required, this.validarCUIT()]],
      phoneNumber: ['', [Validators.required, Validators.pattern('[0-9]{10}$')]],
      createdUser:[this.userService.getUser().id],
      email: ['', [Validators.required, Validators.email, this.emailDomainValidator]],
      supplierType: ['OTHER', Validators.required],
      address: ['', Validators.required],
      discontinued: [false]
    });

    this.checkCuit();
    this.checkEmail();
    this.chechName();
  }
  isFieldInvalid(field: string): boolean {
    const control = this.proveedorForm.get(field);
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }
  cuitExists: boolean = false;
  checkCuit() {

    this.proveedorForm.get('cuit')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((cuit) => {
          this.cuitExists = false;
          return this.supplierService.getSupplierByCuit(cuit);
        })
      )
      .subscribe(
        (exists: boolean) => {
          this.cuitExists = exists;
          const cuitControl = this.proveedorForm.get('cuit');

          if (exists) {
            cuitControl?.setErrors({ cuitExists: true });
          } 
        },
        (error) => {
          console.error('Error al verificar el CUIT', error);
        }
      );
  }

  emailExists: boolean = false;

  checkEmail() {
    this.proveedorForm.get('email')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((email) => {
          this.emailExists = false;
          return this.supplierService.getSupplierByEmail(email);
        })
      )
      .subscribe(
        (exists: boolean) => {
          this.emailExists = exists;
          const emailControl = this.proveedorForm.get('email');

          if (exists) {
            emailControl?.setErrors({ emailExists: true });
          } 
        },
        (error) => {
          console.error('Error al verificar el Email', error);
        }
      );

  }

  nameExists: boolean = false;
  chechName() {
    this.proveedorForm.get('name')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((name) => {
          this.nameExists = false;
          return this.supplierService.getSupplierByName(name);
        })
      )
      .subscribe(
        (exists: boolean) => {
          this.nameExists = exists;
          const nameControl = this.proveedorForm.get('name');

          if (exists) {
            nameControl?.setErrors({ nameExists: true });
          } else {
            nameControl?.setErrors(null);
          }
        },
        (error) => {
          console.error('Error al verificar el Nombre', error);
        }
      );

  }

  validarCUIT(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        // Elimina guiones o espacios del CUIT
        const cuilLimpio = control.value.replace(/[-\s]/g, "");
  
        // Verifica que tenga exactamente 11 dígitos
        if (!/^\d{11}$/.test(cuilLimpio)) {
          return { cuilInvalido: true };
        }
  
        // Verifica que los primeros 2 dígitos sean un tipo válido (20, 23, 24, 27, 30, 33, 34)
        const tipo = parseInt(cuilLimpio.substring(0, 2), 10);
        console.log(tipo);
        const tiposValidos = [20, 23, 24, 27, 30, 33, 34];
        if (!tiposValidos.includes(tipo)) {
          console.log("no es valido")
          return { cuilInvalido: true };
        }
        // Calcula el dígito verificador
        const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]; // Coeficientes para el cálculo
        let suma = 0;
        for (let i = 0; i < multiplicadores.length; i++) {
          suma += parseInt(cuilLimpio[i], 10) * multiplicadores[i];
        }
        const resto = suma % 11;
        const digitoCalculado = resto === 0 ? 0 : 11 - resto;
        const digitoVerificador = parseInt(cuilLimpio[10], 10);
        // Verifica si el dígito verificador es correcto       
        if (digitoCalculado !== digitoVerificador) {
          return { cuilInvalido: true };
        }
      }
      return null; 
    };
  }

  emailDomainValidator(control: AbstractControl) {
    const email = control.value;
    if (email && email.endsWith('.com') || email.endsWith('.com.ar') || email.endsWith('.net') || 
    email.endsWith('.mx') || email.endsWith('.org') || email.endsWith('.gov') || email.endsWith('.edu')) {
      return null; 
    } else {
      return { emailDomain: true }; 
    }
  }
  close(){
    this.modal.close()
  }
  clearInputs() {
    this.proveedorForm = this.fb.group({
      name: ['', Validators.required],
      cuit: ['', [
        Validators.required, this.validarCUIT()]],
      phoneNumber: ['', [Validators.required, Validators.pattern('[0-9]{10}$')]],
      createdUser:[this.userService.getUser().id],
      email: ['', [Validators.required, Validators.email, this.emailDomainValidator]],
      supplierType: ['OTHER', Validators.required],
      address: ['', Validators.required],
      discontinued: [false]
    });
    this.close()
  }
  save() {

    if (this.proveedorForm.valid) {
      const formData = this.proveedorForm.value;
      console.log(formData);
     
      const formAccess = {
        cratedUserId: formData.createdUser,
        name: formData.name,
        cuil: formData.cuit,
        email: formData.email,
      }

      this.supplierService.createSupplierAccess(formAccess).pipe(
        switchMap(response => {
          console.log( "Proveedor cargado: " +JSON.stringify(response))

          return this.supplierService.createSupplier(formData)
        }),
        catchError(error => {
          console.error("Error en el flujo:", error);
          this.eventError.emit('Ocurrio un error al registrar el proveedor');
          return of(null);
        })
      ).subscribe({
        next: response => {
          if (response) {
            console.log("Acceso creado:", JSON.stringify(response));
            this.eventSucces.emit();
            this.clearInputs();
          }
        }
      });
    }
  }
}

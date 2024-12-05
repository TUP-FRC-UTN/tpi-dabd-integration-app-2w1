import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SuppliersService } from '../../services/suppliers.service';
import { Router, RouterModule } from '@angular/router';
import { iepBackButtonComponent } from '../../../common-components/iep-back-button/iep-back-button.component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { catchError, debounceTime, distinctUntilChanged, max, of, Subscription, switchMap } from 'rxjs';
import { AuthService } from '../../../../users/users-servicies/auth.service';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';


@Component({
  selector: 'app-iep-suppliers-form',
  standalone: true,
  imports: [iepBackButtonComponent, ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './iep-suppliers-form.component.html',
  styleUrl: './iep-suppliers-form.component.css'
})
export class IepSuppliersFormComponent implements OnInit,OnDestroy {
  proveedorForm!: FormGroup;
  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  constructor(private fb: FormBuilder, private supplierService: SuppliersService, private router: Router, private userService: AuthService
    , private tutorialService: TutorialService
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
      },
      keyboardNavigation: false,
      useModalOverlay: true,
    })}
    
    
    
    
    ngOnDestroy(): void {
   //TUTORIAL
 this.tutorialSubscription.unsubscribe();
 if (this.tour) {
   this.tour.complete();
 }

 if (this.tutorialSubscription) {
   this.tutorialSubscription.unsubscribe();
 } 
;
  }
;

  ngOnInit(): void {
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

     //TUTORIAL
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
    this.tour.addStep({
      id: 'table-step',
      title: 'Formulario para alta de proveedor',
      text: 'Acá puede guardar en el sistema un proveedor con los datos que indique',
      attachTo: {
        element: '#pantalla',
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
      id: 'subject-step',
      title: 'Tipo de proveedor',
      text: 'Desde acá podrá seleccionar el tipo de proveedor.', 
        attachTo: {
        element: '#combo',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        }
      ]
      
    });
    this.tour.addStep({
      id: 'subject-step',
      title: 'Registrar',
      text: 'Para finalizar podrá registrar un proveedor en el sistema.', 
        attachTo: {
        element: '#registrar',
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


  onSubmit() {

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
  
          Swal.fire({
            title: 'Error',
            text: 'Error en el servidor, intente nuevamente más tarde',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6',
          });
  
          return of(null);
        })
      ).subscribe({
        next: response => {
          if (response) {
            console.log("Acceso creado:", JSON.stringify(response));
  
            Swal.fire({
              title: '¡Guardado!',
              text: 'Proveedor guardado con éxito',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#3085d6',
            }).then(() => {
              this.router.navigate(['main/providers/suppliers']);
            });
          }
        }
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.proveedorForm.get(field);
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }
  goBack() {
    window.history.back();
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
}
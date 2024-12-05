import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { SuppliersService } from '../../services/suppliers.service';
import { Supplier } from '../../models/suppliers';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../users/users-servicies/auth.service';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

@Component({
  selector: 'app-iep-supplier-update',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterModule],
  templateUrl: './iep-supplier-update.component.html',
  styleUrl: './iep-supplier-update.component.css'
})
export class IepSupplierUpdateComponent implements OnInit,OnDestroy{
//TUTORIAL
tutorialSubscription = new Subscription();
private tour: Shepherd.Tour;
  proveedorForm!: FormGroup;
  id:number=0;

  constructor(private activateRoute:ActivatedRoute,private supplierService:SuppliersService,private fb: FormBuilder,
    private router:Router,private userService : AuthService, private tutorialService: TutorialService
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
}
; 
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
    id: 'intro-step',
    title: 'Formulario para editar un proveedor',
    text: 'Acá puede editar la información de un proveedor con los datos que indique.',
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
    id: 'type-step',
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
    id: 'submit-step',
    title: 'Guardar',
    text: 'Para finalizar haga click en Guardar para guardar los cambios realizados.',
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
      const supplierUpdate: Supplier = {
        id: this.id, 
        name: this.proveedorForm.value.name,
        cuit: this.proveedorForm.value.cuit,
        address: this.proveedorForm.value.address,
        supplierType: this.proveedorForm.value.supplierType, 
        description: this.proveedorForm.value.description,
        phoneNumber: this.proveedorForm.value.phoneNumber,
        email: this.proveedorForm.value.email,
        discontinued: this.proveedorForm.value.discontinued
      };
  
      this.supplierService.updateSupplier(supplierUpdate).subscribe(
          {
        next: response=> {
          console.log(JSON.stringify(response))
          Swal.fire({
            title: '¡Guardado!',
            text: "Proveedor actualizado con exito",
            icon: 'success',
            confirmButtonText: 'Aceptar',
            showCancelButton: false,
            confirmButtonColor: '#3085d6'
          }).then(() => {
            this.router.navigate(['/main/providers/suppliers'])});
          console.log("PASO: ", response);
        },
        error: error => {
          
          Swal.fire({
            title: 'Error',
            text: "'Error al actualizar el proveedor'",
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6'
          });
       
          console.log("error:"+error.error.message)
          console.error(error);
                 
        }
      }
      );
    }
  }
  
 

  supplierUpdate?:Supplier;

  ngOnInit(): void {
    this.proveedorForm = this.fb.group({
      name: ['', Validators.required],
      cuit: ['', Validators.required],
      phoneNumber: ['', [Validators.required,Validators.pattern('^[0-9]*$')]],
      email: ['', [Validators.required, Validators.email, this.emailDomainValidator]],
      supplierType: ['', Validators.required],
      address: ['', Validators.required],
      createdUser: [0],
      authorized: [false],
      discontinued:[false]
    });
  
    this.searchSupplier();
     //TUTORIAL
     this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    ); 
  }
  
  searchSupplier() {
    this.id = Number(this.activateRoute.snapshot.paramMap.get('id'));
    if (this.id) {
      this.supplierService.getSupplierById(this.id)
        .subscribe(
          supplier => {
            this.supplierUpdate = supplier;
            this.proveedorForm.patchValue({
              name: supplier.name,
              cuit: supplier.cuit,
              phoneNumber: supplier.phoneNumber,
              email: supplier.email,
              supplierType: supplier.supplierType,
              address: supplier.address,
              authorized: supplier.authorized,
              discontinued:supplier.discontinued
            });
          },
          error => console.error('Error al obtener el proveedor', error)
        );
    } else {
      console.error('ID no válido');
    }
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

  isFieldInvalid(field: string): boolean {
    const control = this.proveedorForm.get(field);
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }
  

}
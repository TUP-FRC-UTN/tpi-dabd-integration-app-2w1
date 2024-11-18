import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SuppliersService } from '../../services/suppliers.service';
import { Router, RouterModule } from '@angular/router';
import { iepBackButtonComponent } from '../../../common-components/iep-back-button/iep-back-button.component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';


@Component({
  selector: 'app-iep-suppliers-form',
  standalone: true,
  imports: [iepBackButtonComponent,ReactiveFormsModule,RouterModule,CommonModule],
  templateUrl: './iep-suppliers-form.component.html',
  styleUrl: './iep-suppliers-form.component.css'
})
export class IepSuppliersFormComponent {
  proveedorForm!: FormGroup;
  
  constructor(private fb: FormBuilder,private supplierService:SuppliersService,private router: Router) {}

  ngOnInit(): void {
    this.proveedorForm = this.fb.group({
      name: ['', Validators.required],
      cuit: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      email: ['', [Validators.required, Validators.email]],
      supplierType: ['OTHER', Validators.required],
      address: ['', Validators.required],
      discontinued:[false] 
    });

  this.checkCuit();
  this.checkEmail();
  this.chechName();
 }
  

  onSubmit() {

    Swal.fire({
      icon: "success",
      title: "Proveedor registrado",
      text: "El nuevo proveedor se ha registrado correctamente.",
      confirmButtonText: "Aceptar" 
    }).then(() => {
      this.router.navigate(['/home/suppliers']);
    });
    

    if (this.proveedorForm.valid) {
      const formData = this.proveedorForm.value;
      console.log(formData);
      this.supplierService.createSupplier(formData).subscribe((response) => {
        this.proveedorForm.reset();
        this.router.navigate(['/suppliers']);
        
      });
    }
  }



  isFieldInvalid(field: string): boolean {
    const control = this.proveedorForm.get(field);
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }
  goBack() {
    this.router.navigate(['/home/suppliers']);
  }

  cuitExists: boolean = false;
  checkCuit(){
    
this.proveedorForm.get('cuit')?.valueChanges
.pipe(
  debounceTime(500),
  distinctUntilChanged(), 
  switchMap(cuit => {
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
    } else {
      cuitControl?.setErrors(null);
    }
  },
  (error) => {
    console.error('Error al verificar el CUIT', error);
  }
);
  }

  emailExists: boolean = false;

checkEmail(){
this.proveedorForm.get('email')?.valueChanges
.pipe(
  debounceTime(500), 
  distinctUntilChanged(), 
  switchMap(email => {
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
    } else {
      emailControl?.setErrors(null);
    }
  },
  (error) => {
    console.error('Error al verificar el Email', error);
  }
);

}

nameExists: boolean = false;
chechName(){
this.proveedorForm.get('name')?.valueChanges
.pipe(
  debounceTime(500),
  distinctUntilChanged(),
  switchMap(name => {
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

}

import { Component } from '@angular/core';
import { iepBackButtonComponent } from "../iep-back-button/iep-back-button.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SuppliersService } from '../../services/suppliers.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-iep-suppliers-form',
  standalone: true,
  imports: [iepBackButtonComponent,ReactiveFormsModule,RouterModule],
  templateUrl: './iep-suppliers-form.component.html',
  styleUrl: './iep-suppliers-form.component.css'
})
export class IepSuppliersFormComponent {
  proveedorForm!: FormGroup;

  constructor(private fb: FormBuilder,private supplierService:SuppliersService,private router: Router) {}

  ngOnInit(): void {
    this.proveedorForm = this.fb.group({
      name: ['', Validators.required],
      healthInsurance: [0, Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      email: ['', [Validators.required, Validators.email]],
      supplierType: ['OTHER', Validators.required],
      address: ['', Validators.required],
      description: [''],
      createdUser: [0] ,
      discontinued:[false] 
    });
  }

  onSubmit() {
    if (this.proveedorForm.valid) {
      const formData = this.proveedorForm.value;
      console.log(formData);
      this.supplierService.createSupplier(formData).subscribe((response) => {
        this.proveedorForm.reset();
        this.router.navigate(['/suppliers']);
        
      });
    }
  }
}

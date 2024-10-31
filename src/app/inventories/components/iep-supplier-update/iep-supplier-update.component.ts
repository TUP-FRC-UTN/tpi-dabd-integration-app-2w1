import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProvidersService } from '../../services/providers.service';
import { SuppliersService } from '../../services/suppliers.service';
import { Supplier } from '../../models/suppliers';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { error } from 'jquery';

@Component({
  selector: 'app-iep-supplier-update',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './iep-supplier-update.component.html',
  styleUrl: './iep-supplier-update.component.css'
})
export class IepSupplierUpdateComponent implements OnInit{

  proveedorForm!: FormGroup;
  id:number=0;


  onSubmit() {
    if (this.proveedorForm.valid) {
      const supplierUpdate: Supplier = {
        id: this.id, // Asegúrate de tener la id
        name: this.proveedorForm.value.name,
        healthInsurance: this.proveedorForm.value.healthInsurance,
        authorized: this.proveedorForm.value.authorized,
        address: this.proveedorForm.value.address,
        supplierType: this.proveedorForm.value.supplierType, // Asegúrate de que este valor sea correcto
        description: this.proveedorForm.value.description,
        phoneNumber: this.proveedorForm.value.phoneNumber,
        email: this.proveedorForm.value.email,
        discontinued: this.proveedorForm.value.discontinued
      };
  
      this.supplierService.updateSupplier(supplierUpdate).subscribe(
        response => {
          //alert('Proveedor actualizado exitosamente');
          this.router.navigate(['/suppliers'])
        },
        error => {
          console.error('Error al actualizar el proveedor', error);
          alert('Error al actualizar el proveedor');
        }
      );
    }
  }
  
 

  supplierUpdate?:Supplier;

  ngOnInit(): void {
    // Inicializa el formulario sin valores específicos para los controles
    this.proveedorForm = this.fb.group({
      name: ['', Validators.required],
      healthInsurance: ['', Validators.required],
      phoneNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      supplierType: ['', Validators.required],
      address: ['', Validators.required],
      description: [''],
      createdUser: [0],
      authorized: [false],
      discontinued:[false]
    });
  
    // Llama a la función para buscar el proveedor por ID
    this.searchSupplier();
  }
  
  searchSupplier() {
    this.id = Number(this.activateRoute.snapshot.paramMap.get('id'));
    if (this.id) {
      this.supplierService.getSupplierById(this.id)
        .subscribe(
          supplier => {
            this.supplierUpdate = supplier;
            // Usa patchValue para actualizar el formulario con los datos del proveedor
            this.proveedorForm.patchValue({
              name: supplier.name,
              healthInsurance: supplier.healthInsurance,
              phoneNumber: supplier.phoneNumber,
              email: supplier.email,
              supplierType: supplier.supplierType,
              address: supplier.address,
              description: supplier.description,
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
  
  back(){
    this.router.navigate(['/suppliers']);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.proveedorForm.get(field);
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }
  
constructor(private activateRoute:ActivatedRoute,private supplierService:SuppliersService,private fb: FormBuilder,private router:Router){}

}
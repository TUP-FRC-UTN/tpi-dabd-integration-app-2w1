import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import {  Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ProductService } from '../../services/product.service';
import { ProductXDetailDto } from '../../models/product-xdetail-dto';
import { SuppliersService } from '../../services/suppliers.service';
import { Supplier } from '../../models/suppliers';
import { movementDto } from '../../models/movementDto';
import { Observable, map, catchError, of } from 'rxjs';
import { IncreaseDecrementService } from '../../services/increase-decrement.service';
import Swal from 'sweetalert2';
import { UsersMockIdService } from '../../../common-services/users-mock-id.service';

@Component({
  selector: 'app-iep-nuevo-ingreso-egreso',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule,NgSelectComponent,RouterLink,RouterOutlet,RouterModule],
  templateUrl: './iep-nuevo-ingreso-egreso.component.html',
  styleUrl: './iep-nuevo-ingreso-egreso.component.css'
})
export class IepNuevoIngresoEgresoComponent implements OnInit {


  idUser=0
  formulario:FormGroup = new FormGroup({});
  formularioEgreso:FormGroup = new FormGroup({});
  selectedType: string = 'I';
    constructor(
      private router :Router ,
      private serviceP : ProductService ,
      private serviceS :  SuppliersService,
      private serviceMovment : IncreaseDecrementService,
      private serviceUsers : UsersMockIdService
    ) 
  {  
    
  }
  

  

  productos: ProductXDetailDto [] = [];
  suppliers : Supplier[]=[];
  
  ngOnInit(): void {
    this.formulario = new FormGroup({
      selectedArticule: new FormControl('',Validators.required),  
      selectedSupplier : new FormControl('',Validators.required),
      amount : new FormControl(0,[Validators.required,Validators.min(1)]),
      priceUnit : new FormControl('',[Validators.required,Validators.min(1)]),
      justify : new FormControl('',Validators.required)
    });

    this.formularioEgreso = new FormGroup({
      selectedArticule: new FormControl('',Validators.required),  
      amount : new FormControl(0,[Validators.required,Validators.min(1)],[this.stockInsuficiente()]),
      justify : new FormControl('',Validators.required)
    });
    this.formularioEgreso.get('amount')?.valueChanges.subscribe((x)=>{ this.logErrorsEgreso()})
    this.formulario.get('amount')?.valueChanges.subscribe((x)=>{ this.logErrorsFormulario()})

    this.loadSuppliers();
    this.loadProductos();
    this.idUser= this.serviceUsers.getMockId()
  }

  
  goTo(path: string) {
    console.log('Intentando navegar a:', path);
    this.router.navigate([path]).then(
      success => console.log('Navegación exitosa:', success),
      error => console.error('Error en navegación:', error)
    );
  }

  cancelar(){
    window.history.back()
  }
  onSubmit(){
    console.log("ERRORESSSSS:")
   this.logErrorsEgreso()
   this.logErrorsFormulario()
   console.log("perrra")
   let dto: movementDto
   if(this.selectedType==="I"){
    console.log("FORMULARIO I")
    console.log(this.formulario.value)
    dto= {
    amount: this.formulario.get('amount')?.value,
    date: new Date(Date.now()),
    unitPrice: this.formulario.get('priceUnit')?.value,
    productId: this.formulario.get('selectedArticule')?.value,
    type: this.selectedType,
    supplierId: this.formulario.get('selectedSupplier')?.value,
    justification : this.formulario.get('justify')?.value
    }}
    else {
      console.log("FORMULARIO E")
      console.log(this.formularioEgreso.value)
      dto ={
        amount: this.formularioEgreso.get('amount')?.value,
        date: new Date(Date.now()),
        unitPrice: undefined,
        productId: this.formularioEgreso.get('selectedArticule')?.value,
        type: this.selectedType,
        supplierId: undefined,
        justification: this.formularioEgreso.get('justify')?.value
      }

    }
    this.serviceMovment.createMovement(dto,this.idUser).subscribe({
    next: response => {
      console.log(JSON.stringify(response))
      Swal.fire({
        title: '¡Guardado!',
        text: "Movimiento guardado con exito",
        icon: 'success',
        confirmButtonText: 'Aceptar',
        showCancelButton: false,
        confirmButtonColor: '#3085d6'
      }).then(() => {
        this.formulario.reset()
        this.goTo('/home/modification-stock-list')
      });
      console.log("PASO: ", response);
    },
    error: error => {
      
      Swal.fire({
        title: 'Error',
        text: "Error en el servidor intente nuevamente mas tarde",
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6'
      });
   
      console.log("error:"+error.error.message)
      console.error(error);
             
    }})}

  logErrorsFormulario() {
    Object.keys(this.formulario.controls).forEach(controlName => {
      const control = this.formulario.get(controlName);
      if (control && control.errors) {
        console.log(`Errors for ${controlName}:`, control.errors);
      }
    });
  }

  logErrorsEgreso() {
    Object.keys(this.formularioEgreso.controls).forEach(controlName => {
      const control = this.formularioEgreso.get(controlName);
      if (control && control.errors) {
        console.log(`Errors for ${controlName}:`, control.errors);
      }
    });
  }


  loadProductos(){

  this.serviceP.getAllProducts().subscribe((data : ProductXDetailDto[] )=>{

    this.productos=[]
    data.forEach(x =>{
      if(!x.discontinued){this.productos.push(x)
        
      }
      else{console.log("EL DESCONTINUADO")
        console.log(x)}     
    })  
   
  })
}
   
   loadSuppliers(){

    this.serviceS.getAll().subscribe((data : Supplier[]) =>{

      this.suppliers = data
      console.log(this.suppliers)
    })
   }

   stockInsuficiente(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const id = this.formularioEgreso.get('selectedArticule')?.value;
      const cantidad = control.value;
  
      if (!id || !cantidad) {
        return of(null);  // Si no hay id o cantidad, no valida aún
      }
  
      return this.serviceP.getAllProducts().pipe(
        map((data: ProductXDetailDto[]) => {
          const producto = data.find(p => p.id === id);
          
          if (!producto) {
            return { noExistProduct: true }; // Producto no existe
          }
          
          if (producto.stock < cantidad) {
            return { insuficientStock: true }; // Stock insuficiente
          }
          
          return null;  // Sin errores
        }),
        catchError(() => of(null))  // Si hay error en la solicitud, no genera error de validación
      );
    };
  }


}

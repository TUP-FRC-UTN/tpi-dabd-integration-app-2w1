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
import { Observable, map, catchError, of, Subscription } from 'rxjs';
import { IncreaseDecrementService } from '../../services/increase-decrement.service';
import Swal from 'sweetalert2';
import { UsersMockIdService } from '../../../common-services/users-mock-id.service';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

@Component({
  selector: 'app-iep-nuevo-ingreso-egreso',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule,NgSelectComponent,RouterLink,RouterOutlet,RouterModule],
  templateUrl: './iep-nuevo-ingreso-egreso.component.html',
  styleUrl: './iep-nuevo-ingreso-egreso.component.css'
})
export class IepNuevoIngresoEgresoComponent implements OnInit {


  idUser=0
  SwalMessage: string|undefined;
  formulario:FormGroup = new FormGroup({});
  formularioEgreso:FormGroup = new FormGroup({});
  selectedType: string = 'I';
    constructor(
      private router :Router ,
      private serviceP : ProductService ,
      private serviceS :  SuppliersService,
      private serviceMovment : IncreaseDecrementService,
      private serviceUsers : UsersMockIdService, 
      private tutorialService: TutorialService
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
      }); }
  productos: ProductXDetailDto [] = [];
  suppliers : Supplier[]=[];
  
  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

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

  ngOnInit(): void {
    this.formulario = new FormGroup({
      selectedArticule: new FormControl('',Validators.required),  
      selectedSupplier : new FormControl('',Validators.required),
      amount : new FormControl('',[Validators.required,Validators.min(1)]),
      // priceUnit : new FormControl('',[Validators.required,Validators.min(1)]),
      justify : new FormControl('',Validators.required)
      
    });

    this.formularioEgreso = new FormGroup({
      selectedArticule: new FormControl('',Validators.required),  
      amount : new FormControl('',[Validators.required,Validators.min(1)],[this.stockInsuficiente()]),
      justify : new FormControl('',Validators.required)
    });
    this.formularioEgreso.get('amount')?.valueChanges.subscribe((x)=>{ this.logErrorsEgreso()})
    this.formulario.get('amount')?.valueChanges.subscribe((x)=>{ this.logErrorsFormulario()})
    this.formularioEgreso.get('selectedArticule')?.valueChanges.subscribe((x)=>{ 
      this.formularioEgreso.get('amount')?.setValue(0)
      this.logErrorsEgreso()
    })
    this.loadSuppliers();
    this.loadProductos();
    this.idUser= this.serviceUsers.getMockId();

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
    
    while (this.tour.steps.length > 0) {
      this.tour.removeStep(this.tour.steps[this.tour.steps.length - 1].id);
    }
  
    this.tour.addStep({
      id: 'movement-type-step',
      title: 'Tipo de Movimiento',
      text: 'Seleccione el tipo de movimiento: Ingreso o Egreso. Cada tipo tiene un formulario similar para registrar movimientos de inventario.',
      attachTo: {
        element: '.btn-group[role="group"]',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Siguiente',
          action: this.tour.next,
        }
      ]
    });
  
    this.tour.addStep({
      id: 'article-step',
      title: 'Selección de Artículo',
      text: 'Elija el artículo para el cual desea registrar el movimiento.',
      attachTo: {
        element: '#productos',
        on: 'bottom'
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

    if(this.selectedType==="I"){
      this.tour.addStep({
        id: 'create-article-step',
        title: 'Crear Artículo',
        text: 'En caso de no encontrar el artículo que desea registrar, puede crear uno nuevo haciendo click acá.',
        attachTo: {
          element: '#addProductButton',
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
        id: 'provider-step',
        title: 'Selección de Proveedor',
        text: 'Elija el proveedor para el cual desea registrar el movimiento.',
        attachTo: {
          element: '#provider',
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
        id: 'create-article-step',
        title: 'Crear Artículo',
        text: 'En caso de no encontrar el proveedor que desea registrar, puede crear uno nuevo haciendo click acá.',
        attachTo: {
          element: '#addProviderButton',
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
    }
  
    this.tour.addStep({
      id: 'submit-step',
      title: 'Cargar Movimiento',
      text: 'Cuando haya completado todos los campos, haga clic en "Registrar" para guardar el movimiento. El botón estará deshabilitado hasta que complete todos los campos requeridos.',
      attachTo: {
        element: 'button[type="submit"]',
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

   this.logErrorsEgreso()
   this.logErrorsFormulario()
   console.log("perrra")
   let dto: movementDto
   if(this.selectedType==="I"){

    console.log(this.formulario.value)
    dto= {
    amount: this.formulario.get('amount')?.value,
    date: new Date(Date.now()),
    // unitPrice: this.formulario.get('priceUnit')?.value,
    productId: this.formulario.get('selectedArticule')?.value,
    type: this.selectedType,
    supplierId: this.formulario.get('selectedSupplier')?.value,
    justification : this.formulario.get('justify')?.value
    }}
    else {

      console.log(this.formularioEgreso.value)
      dto ={
        amount: this.formularioEgreso.get('amount')?.value,
        date: new Date(Date.now()),
        // unitPrice: undefined,
        productId: this.formularioEgreso.get('selectedArticule')?.value,
        type: this.selectedType,
        supplierId: undefined,
        justification: this.formularioEgreso.get('justify')?.value
      }

    }
    this.serviceMovment.createMovement(dto,this.idUser).subscribe({
    next: response => {
      console.log(JSON.stringify(response))
      this.SwalMessage = "Movimiento registrado con éxito."
      this.showSuuccessMessage()
      console.log("PASO: ", response);
    },
    error: error => {
      this.handleErrors(error);
    }})}

    showSuuccessMessage(){
      Swal.fire({
        title: '¡Guardado!',
        text: this.SwalMessage,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        showCancelButton: false,
      }).then(() =>{
        this.formulario.reset();
        this.goTo('/main/inventories/stock-movements-history');
      });
    }
    
    showErrorMessage(){
      Swal.fire({
        title: 'Error',
        text: this.SwalMessage,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6'
      });
    }
    
    handleErrors(err: any) { 
      console.error('Error:', err);
      if(err.error.message=='400 Insufficient stock quantity'){
        this.SwalMessage = "El stock al que intenta actualizar es menor al stock actual del producto."
        this.showErrorMessage()
      }else{
        if(err.error.message=='404 Supplier not found'){
          this.SwalMessage = "El proveedor ingresado no fue encontrado."
          this.showErrorMessage();
        }else if(err.error.message=='404 Product not found.'){
          this.SwalMessage = "El producto ingresado no fue encontrado."
          this.showErrorMessage();
        }
      }
      return null;
    }

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

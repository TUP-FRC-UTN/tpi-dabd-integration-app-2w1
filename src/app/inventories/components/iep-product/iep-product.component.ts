import { Component, NgModule } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Observable } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProvidersService } from '../../services/providers.service';
import { RouterModule } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';
import { CreateProductDtoClass } from '../../models/create-product-dto-class';
import { ProductCategory } from '../../models/product-category';
import { Provider } from '../../models/provider';
import { Supplier } from '../../models/suppliers';
import { SuppliersService } from '../../services/suppliers.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './iep-product.component.html',
  styleUrl: './iep-product.component.css'
})
export class IepProductComponent {
  private productService: ProductService;
  private providerService: SuppliersService;
  categories: ProductCategory[] = [];
  categories$: Observable<ProductCategory[]>= new Observable<ProductCategory[]>();
  providers: Supplier[] = [];
  providers$: Observable<Supplier[]>= new Observable<Supplier[]>();
  dto: CreateProductDtoClass = new CreateProductDtoClass();
  categoriesError: boolean = false;
  providersError: boolean = false;
  help: boolean = false;
  createProduct$: Observable<any>= new Observable<any>();
  success: boolean | undefined;
  requestInProgress: boolean = false;
  abrirModal: boolean = false;
  successMessage: string|undefined;
  errorMessage: string|undefined;
  newCategory: string = ''; 
  categoryOfModal: number | undefined;

  constructor(productService: ProductService,
    providersService: SuppliersService,private categoryService:CategoriaService) {
    this.productService = productService;
    this.providerService = providersService;
    this.success = false;
  }

  ngOnInit() {

    this.loadCategories();
    this.newCategory = '';
    this.providers$ = this.providerService.getAll();
    this.providers$.subscribe({
      next: providers =>{
        this.providers = providers;
        console.log(providers);
        this.providersError = false;
      },
      error: error => this.providersError = true
    })
  }

  setCategoryDescription(){
    console.log(this.categoryOfModal);
    if(this.categoryOfModal != 0){
    this.categories.forEach(category => {
      console.log(category.id);
      if(category.id == this.categoryOfModal){

        this.newCategory = category.category;
      }
    });
  }
  }

  showSuccessAlert() {
    Swal.fire({
      icon: 'success',
      title: 'Registro creado',
      text: this.successMessage,
      confirmButtonText: 'OK'
    });
  }


  showErrorAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: this.errorMessage,
      confirmButtonText: 'Intentar de nuevo'
    });
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      if (this.dto.supplier_id == null || this.dto.supplier_id === 0) {
        this.dto.supplier_id = undefined;
      }
      if(this.dto.unit_price == null || this.dto.unit_price === 0) {
        this.dto.unit_price = 0;
      }
      this.abrirModal = true;
      this.createProduct$ = this.productService.createProduct(this.dto, 1);
      console.log(this.createProduct$);
      this.createProduct$.subscribe({
        next: response => {
          this.successMessage = response.message;
          this.showSuccessAlert();
          console.log("PASO: ", response);
          form.reset();
        },
        error: error => {
          if(error.error.message === '400 Ya existe un producto con ese nombre') {
            this.errorMessage = 'Ya existe un producto con ese nombre';
          }else if( error.error.message === '400 No existe el proveedor ingresado') {
            this.errorMessage = 'No existe el proveedor ingresado';
          }else if( error.error.message === '400 No existe la categoria ingresada') {
            this.errorMessage = 'La categoría ingresada no existe';
          }else if( error.error.message === '400 Estado invalido') {
            this.errorMessage = 'El estado del producto ingresado es inválido';
          }else if( error.error.message === '500 Error al crear el producto') {
            this.errorMessage = 'Ha ocurrido un error al crear el producto.';
          }else{
            this.errorMessage = 'Ha ocurrido un error al crear el producto.';
          }
          console.error(error);
          this.success = false;
          this.showErrorAlert();
          form.reset();
        },
        complete: () => {
          console.log('Petición completada');
        }
      });
    }
  }


  loadCategories(){
    this.categories$ = this.categoryService.getCategorias();
    this.requestInProgress = true;
    this.categories$.subscribe({
      next: categories => {
        this.categories = categories;
        console.log(categories);
        this.categoriesError = false;
        this.requestInProgress = false;
      },
      error: error => {
        console.error(error);
        this.categoriesError = true;
        this.requestInProgress = false;
        console.error('Error al obtener las categorías de productos');
      },
    });
  }

  closeModal() {
    this.abrirModal = false;
  }


  openModal(): void {
    /*const dialogRef = this.dialog.open(ModalSelectComponent, {
      width: '400px'
    });*/
  
   /* dialogRef.componentInstance.categoryAdded.subscribe(() => {
      this.loadCategories(); 
    });

    /*dialogRef.afterClosed().subscribe(result => {
      console.log('El modal se cerró', result);
      
    });*/
  }

  goBack() {
    window.history.back();
  }  
}
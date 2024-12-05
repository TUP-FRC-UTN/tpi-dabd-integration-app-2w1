import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Observable, Subscription } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductCategory } from '../../models/product-category';
import { Supplier } from '../../models/suppliers';
import { SuppliersService } from '../../services/suppliers.service';
import Swal from 'sweetalert2';
import { CreateProductDtoClass } from '../../models/create-product-dto-class';
import { CategoriaService } from '../../services/categoria.service';
import { CreateCategoryDto } from '../../models/create-category-dto';
import { NgSelectModule } from '@ng-select/ng-select';
import { UpdateProductDto } from '../../models/update-product-dto';
import { AuthService } from '../../../../users/users-servicies/auth.service';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NgSelectModule],
  templateUrl: './iep-product.component.html',
  styleUrl: './iep-product.component.css'
})
export class IepProductComponent implements OnInit, OnDestroy {
  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;
  private dtoUpdate: UpdateProductDto | undefined;
  private productService: ProductService;
  private providerService: SuppliersService;
  categories: ProductCategory[] = [];
  categories$: Observable<ProductCategory[]> = new Observable<ProductCategory[]>();
  providers: Supplier[] = [];
  providers$: Observable<Supplier[]> = new Observable<Supplier[]>();
  dto: CreateProductDtoClass = new CreateProductDtoClass();
  dtoBeforeUpdate: CreateProductDtoClass = new CreateProductDtoClass();
  categoriesError: boolean = false;
  providersError: boolean = false;
  help: boolean = false;
  createProduct$: Observable<any> = new Observable<any>();
  success: boolean | undefined;
  requestInProgress: boolean = false;
  abrirModal: boolean = false;
  successMessage: string | undefined;
  errorMessage: string | undefined;
  newCategory: string = '';
  categoryOfModal: number | undefined;
  idProductToEdit: number | undefined;

  constructor(productService: ProductService,
    providersService: SuppliersService,
    private categoryService: CategoriaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: AuthService, private tutorialService: TutorialService
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
      useModalOverlay: true,
    });

    this.idProductToEdit = this.activatedRoute.snapshot.params['id'];
    console.log(this.idProductToEdit);
    this.productService = productService;
    this.providerService = providersService;
    this.success = false;
    this.setProductToEdit();
  }
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

  dtoIsEqual(): boolean {
    if (this.dto.name == this.dtoBeforeUpdate.name &&
      this.dto.reusable == this.dtoBeforeUpdate.reusable &&
      this.dto.minAmountWarning == this.dtoBeforeUpdate.minAmountWarning
      && this.dto.description == this.dtoBeforeUpdate.description
      && this.dto.category_id
      == this.dtoBeforeUpdate.category_id) {
      return true;
    }
    return false;
  }

  setProductToEdit() {
    if (this.idProductToEdit != undefined) {
      const aux = this.productService.getProductById(this.idProductToEdit).subscribe({
        next: product => {
          this.dto = product;
          this.dtoBeforeUpdate.category_id = this.dto.category_id;
          this.dtoBeforeUpdate.description = this.dto.description;
          this.dtoBeforeUpdate.minAmountWarning = this.dto.minAmountWarning;
          this.dtoBeforeUpdate.name = this.dto.name;
          this.dtoBeforeUpdate.reusable = this.dto.reusable;
          console.log("asi se carga")
          console.log(this.dto);
        },
        error: error => {
          console.error(error);
          this.showProductCouldntBeFoundAlert();
        }
      });
      this.tutorialSubscription.add(aux)
    }
  }

  showProductCouldntBeFoundAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'El producto no pudo ser encontrado para su modificación',
      confirmButtonText: 'Intentar de nuevo'
    });
  }


  logear() {
    console.log(this.dto.reusable)
  }

  logearrr() {
    console.log(this.dto.minAmountWarning)

  }

  goTo(path: string) {

    this.router.navigate([path])

  }

  ngOnInit() {
    //TUTORIAL
    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
    this.loadCategories();
    this.newCategory = '';
    this.providers$ = this.providerService.getAll();
    this.providers$.subscribe({
      next: providers => {
        const filteredSuppliers = providers.filter(p => !p.discontinued);
        this.providers = filteredSuppliers;
        console.log(this.categories);
        this.providersError = false;
        this.requestInProgress = false;
      },
      error: error => this.providersError = true
    })
  }

  setCategoryDescription() {
    console.log(this.categoryOfModal);
    if (this.categoryOfModal != 0) {
      this.categories.forEach(category => {
        console.log(category.id);
        if (category.id == this.categoryOfModal) {

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
    }).then(() => {
      window.history.back();
    });
  }

  showUpdateSuccessAlert() {
    Swal.fire({
      icon: 'success',
      title: 'Registro actualizado',
      text: this.successMessage,
      confirmButtonText: 'OK'
    }).then(() => {
      this.router.navigate(['/main/inventories/inventory']);
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

  createProduct(form: NgForm) {
    this.createProduct$ = this.productService.createProduct(this.dto, this.userService.getUser().id);
    console.log(this.createProduct$);
    this.createProduct$.subscribe({
      next: response => {
        console.log("aca ta la respuesta" + JSON.stringify(response))
        this.successMessage = response.message;
        this.showSuccessAlert();
        console.log("PASO: ", response);
        form.reset();
      },
      error: error => {
        if (error.error.message === '400 Ya existe un producto con ese nombre') {
          this.errorMessage = 'Ya existe un producto con ese nombre';
        } else if (error.error.message === '400 No existe el proveedor ingresado') {
          this.errorMessage = 'No existe el proveedor ingresado';
        } else if (error.error.message === '400 No existe la categoria ingresada') {
          this.errorMessage = 'La categoría ingresada no existe';
        } else if (error.error.message === '400 Estado invalido') {
          this.errorMessage = 'El estado del producto ingresado es inválido';
        } else if (error.error.message === '500 Error al crear el producto') {
          this.errorMessage = 'Ha ocurrido un error al crear el producto.';
        } else {
          this.errorMessage = 'Ha ocurrido un error al crear el producto.';
        }
        console.error(error);
        this.success = false;
        this.showErrorAlert();
      },
      complete: () => {
        console.log('Petición completada');
      }
    });
  }


  updateProduct(form: NgForm) {

    console.log('d');
    console.log(this.dto);
    const mappedDto: UpdateProductDto = {
      id: this.idProductToEdit ?? 0,
      name: this.dto.name ?? '',
      reusable: this.dto.reusable ?? false,
      minAmountWarning: this.dto.minAmountWarning ?? 0,
      description: this.dto.description ?? '',
      categoryId: this.dto.category_id ?? 0,
    };

    console.log(JSON.stringify(mappedDto));
    this.productService.updateProduct(mappedDto, this.userService.getUser().id).subscribe({
      next: response => {
        this.successMessage = response.message;
        this.showUpdateSuccessAlert();
        console.log("PASO: ", response);
        form.reset();

      },
      error: error => {
        console.error(error);
        if (error.error.message === '404 Product not found') {
          this.errorMessage = 'El producto no pudo ser encontrado para su modificación';
        } else if (error.error.message === '404 Category not found') {
          this.errorMessage = 'La categoría ingresada no existe';
        } else {
          this.errorMessage = 'Ha ocurrido un error al actualizar el producto.';
        }
        this.success = false;
        this.showErrorAlert();
      },
      complete: () => {
        console.log('Petición completada');
      }
    });
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      if (this.dto.supplier_id == null || this.dto.supplier_id === 0) {
        this.dto.supplier_id = undefined;
      }
      if (this.dto.unitPrice == null || this.dto.unitPrice === 0) {
        this.dto.unitPrice = 0;
      }
      if (this.dto.minAmountWarning == null || this.dto.minAmountWarning === 0) {
        this.dto.minAmountWarning = 0;
      }
      if (this.dto.reusable == null || this.dto.reusable === undefined) {
        this.dto.reusable = false;
      }
      this.abrirModal = true;
      this.dto.state_id = 1;
      this.dto.description = this.dto.description ?? '   ';
      if (this.idProductToEdit != undefined) {
        this.updateProduct(form);
      } else {
        this.createProduct(form);
      }
    }
  }


  loadCategories() {
    this.categories$ = this.categoryService.getCategorias();
    this.requestInProgress = true;
    this.categories$.subscribe({
      next: categories => {
        const filteredCategories = categories.filter(category => !category.discontinued);
        this.categories = filteredCategories;
        console.log(this.categories);
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

  goBack() {
    window.history.back();
  }

  
  startTutorial() {

    this.tour.addStep({
      id: 'subject-step',
      title: 'Alta de producto',
      text: 'En esta pestaña puede registrar un nuevo producto. Deberá asignarle una categoría, un nombre, una cantidad mínima de la que no debería bajar y la cantidad actual con la que es registrada.',
      attachTo: {
        element: '#newProduct',
        on: 'auto',
      },
      buttons: [

        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'subject-step',
      title: 'Selección de proveedor',
      text: 'Desde acá puede seleccionar el proveedor asignado al producto. Para añadir mas, visite la pestaña de proveedores.',
      attachTo: {
        element: '#providerSelect',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'subject-step',
      title: 'Botón de reusable',
      text: 'Seleccione esta opción si el producto es reusable.',
      attachTo: {
        element: '#reusable',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'subject-step',
      title: 'Registrar producto',
      text: 'Al finalizar, presione este botón para registrar el producto.',
      attachTo: {
        element: '#register',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Finalizar',
          action: this.tour.complete,
        },
      ],
    });

    this.tour.start();
  }
}
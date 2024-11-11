import { Component, inject, OnDestroy, OnInit, AfterViewInit, NgModule } from '@angular/core';
import { debounceTime, min, Observable, Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StockAumentoService } from '../../services/stock-aumento.service';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import 'datatables.net-bs5';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { IepStockIncreaseComponent } from '../iep-stock-increase/iep-stock-increase.component';
import { Details } from '../../models/details';
import { ProductCategory } from '../../models/product-category';
import { ProductXDetailDto } from '../../models/product-xdetail-dto';
import { CategoriaService } from '../../services/categoria.service';
import { DetailServiceService } from '../../services/detail-service.service';
import { EstadoService } from '../../services/estado.service';
import { Row } from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
declare var bootstrap: any; // Añadir esta declaración al principio
// Interfaces existentes actualizadas
interface Filters {
  categoriasSeleccionadas: number[];
  reutilizableSeleccionado: number[];
  nombre: string;
  startDate: string;
  endDate: string;
  cantMinima: number;
  cantMaxima: number;
}


// Nuevas interfaces para ng-select
interface CategoryOption {
  value: number;
  name: string;
}

interface ReusableOption {
  value: number;
  name: string;
}

@Component({
  selector: 'app-iep-inventory',
  standalone: true,
  imports: [FormsModule, CommonModule, IepStockIncreaseComponent, NgSelectModule],
  templateUrl: './iep-inventory.component.html',
  styleUrl: './iep-inventory.component.css',
})
export class IepInventoryComponent implements OnInit, OnDestroy, AfterViewInit {

  errorMessage: string = '';
  // Objeto que mantiene el estado de todos los filtros
  filters: Filters = {
    categoriasSeleccionadas: [],
    reutilizableSeleccionado: [],
    nombre: '',
    startDate: '',
    endDate: '',
    cantMinima: 0,
    cantMaxima: 0

  };

  botonDeshabilitado: boolean = false;

  categoryOptions: CategoryOption[] = [];
  selectedCategories: CategoryOption[] = [];
  
  reusableOptions: ReusableOption[] = [
    { value: 1, name: 'Sí' },
    { value: 2, name: 'No' }
  ];
  selectedReusables: ReusableOption[] = [];

  validarCantidades(): void {
    if (this.cantMinima !== null && this.cantMaxima !== null) {
      this.validoMin = this.cantMinima <= this.cantMaxima;
      this.validoMax = this.cantMaxima >= this.cantMinima;

      // Bloquear el botón si alguno de los valores es inválido
      this.botonDeshabilitado = !(this.validoMin && this.validoMax);

    } else {
      // Si alguno de los dos valores es nulo, no mostrar mensajes de error
      this.validoMin = true;
      this.validoMax = true;
    }
    this.aplicarFiltrosCompletos();
  }

  aplicarFiltrosCompletos(): void {
    // Recoger valores de los inputs
    const nombreInput = document.getElementById('Nombre') as HTMLInputElement;
    if (nombreInput) {
      this.filters.nombre = nombreInput.value;
    }

    const cantMinimaInput = document.getElementById('CantMinima') as HTMLInputElement;
    if (cantMinimaInput) {
      this.filters.cantMinima = Number(cantMinimaInput.value) || 0;
    }

    const cantMaximaInput = document.getElementById('CantMaxima') as HTMLInputElement;
    if (cantMaximaInput) {
      this.filters.cantMaxima = Number(cantMaximaInput.value) || 0;
    }

    // Validar cantidades
    this.validoMin = true;
    this.validoMax = true;

    if (this.filters.cantMinima < 0) {
      this.validoMin = false;
      this.mensajeValidacionMin = 'El número no puede ser menor a cero';
      return;
    }

    if (this.filters.cantMaxima < 0) {
      this.validoMax = false;
      this.mensajeValidacionMax = 'No puedes poner un número menor a cero';
      return;
    }

    if (this.filters.cantMinima > this.filters.cantMaxima && this.filters.cantMaxima !== 0) {
      this.validoMin = false;
      this.mensajeValidacionMin = 'La cantidad mínima no puede ser mayor a la cantidad máxima';
      return;
    }

    // Aplicar todos los filtros
    this.productosFiltered = this.productosALL.filter(producto => {
      // Filtro por nombre
      const nombreCumple = !this.filters.nombre ||
        producto.name.toLowerCase().includes(this.filters.nombre.toLowerCase());

      // Filtro por categorías
      const categoriaCumple = this.filters.categoriasSeleccionadas.length === 0 ||
        this.filters.categoriasSeleccionadas.includes(producto.category.categoryId);

      // Filtro por reutilizable
      const reusableCumple = this.filters.reutilizableSeleccionado.length === 0 ||
        this.filters.reutilizableSeleccionado.includes(producto.reusable ? 1 : 2);

      // Filtro por cantidad
      const amount = producto.detailProducts.length;
      const cantMinimaCumple = !this.filters.cantMinima || amount >= this.filters.cantMinima;
      const cantMaximaCumple = !this.filters.cantMaxima || amount <= this.filters.cantMaxima;

      // Filtro por fecha
      let fechaCumple = true;
      if (this.filters.startDate || this.filters.endDate) {
        let lastDate = this.getLastUpdateDate(producto.detailProducts);
        if (!lastDate) {
          fechaCumple = false;
        } else {
          const productDate = new Date(lastDate);
          if (this.filters.startDate) {
            fechaCumple = fechaCumple && productDate >= new Date(this.filters.startDate);
          }
          if (this.filters.endDate) {
            fechaCumple = fechaCumple && productDate <= new Date(this.filters.endDate);
          }
        }
      }

      return nombreCumple &&
        categoriaCumple &&
        reusableCumple &&
        cantMinimaCumple &&
        cantMaximaCumple &&
        fechaCumple;
    });

    // Actualizar la tabla y los contadores
    this.updateDataTable();
    this.actualizarContadores();
  }

  // Método principal de filtrado que combina todos los filtros
  aplicarFiltrosCombinados(): void {
    this.productosFiltered = this.productosALL.filter(producto => {
      // Filtro por nombre
      const nombreCumple = !this.filters.nombre ||
        producto.name.toLowerCase().includes(this.filters.nombre.toLowerCase());

      // Filtro por categorías
      const categoriaCumple = this.filters.categoriasSeleccionadas.length === 0 ||
        this.filters.categoriasSeleccionadas.includes(producto.category.categoryId);

      // Filtro por reutilizable
      const reusableCumple = this.filters.reutilizableSeleccionado.length === 0 ||
        this.filters.reutilizableSeleccionado.includes(producto.reusable ? 1 : 2);

      // Filtro por cantidad
      const amount = producto.detailProducts.length;
      const cantMinimaCumple = !this.filters.cantMinima || amount >= this.filters.cantMinima;
      const cantMaximaCumple = !this.filters.cantMaxima || amount <= this.filters.cantMaxima;

      // Filtro por fecha
      let fechaCumple = true;
      if (this.filters.startDate || this.filters.endDate) {
        let lastDate = this.getLastUpdateDate(producto.detailProducts);
        if (!lastDate) {
          fechaCumple = false;
        } else {
          const productDate = new Date(lastDate);
          if (this.filters.startDate) {
            fechaCumple = fechaCumple && productDate >= new Date(this.filters.startDate);
          }
          if (this.filters.endDate) {
            fechaCumple = fechaCumple && productDate <= new Date(this.filters.endDate);
          }
        }
      }

      return nombreCumple &&
        categoriaCumple &&
        reusableCumple &&
        cantMinimaCumple &&
        cantMaximaCumple &&
        fechaCumple;
    });

    this.updateDataTable();
    this.actualizarContadores();
  }

  // Método auxiliar para obtener la última fecha de actualización
  private getLastUpdateDate(detailProducts: any[]): string {
    let lastDate = '';
    for (const detail of detailProducts) {
      if (detail.lastUpdatedDatetime && (!lastDate || detail.lastUpdatedDatetime > lastDate)) {
        lastDate = detail.lastUpdatedDatetime;
      }
    }
    return lastDate;
  }

  // Actualiza los contadores después de aplicar los filtros
  private actualizarContadores(): void {
    this.amountAvailable = this.getCountByategoryAndState(1, 'Disponible');
    this.amountBorrowed = this.getCountByategoryAndState(1, 'Prestado');
    this.amountBroken = this.getCountByategoryAndState(1, 'Roto');
  }

  // Añade esto en las propiedades de la clase
  categoriasSeleccionadas: number[] = [];
  reutilizableSeleccionado: number[] = [];

  // Añade este método para manejar los cambios en los checkboxes
/*   onCategoriaChange(event: any, categoryId: number): void {
    if (event.target.checked) {
      this.filters.categoriasSeleccionadas.push(categoryId);
    } else {
      this.filters.categoriasSeleccionadas = this.filters.categoriasSeleccionadas
        .filter(id => id !== categoryId);
    }
  }

  onReutilizableChange(event: any, reusable: number): void {
    if (event.target.checked) {
      this.filters.reutilizableSeleccionado.push(reusable);
    } else {
      this.filters.reutilizableSeleccionado = this.filters.reutilizableSeleccionado
        .filter(id => id !== reusable);
    }
  }
 */


  filtrarPorUltimos30Dias(): void {
    const hoy = new Date();
    const hace30Dias = new Date(hoy.setDate(hoy.getDate() - 30));

    this.productosFiltered = this.productosALL.filter(producto => {
      let lastDate = '';
      for (const detail of producto.detailProducts) {
        if (detail.lastUpdatedDatetime && (!lastDate || detail.lastUpdatedDatetime > lastDate)) {
          lastDate = detail.lastUpdatedDatetime;
        }
      }
      if (!lastDate) {
        return false;
      }

      const productDate = new Date(lastDate);
      return productDate >= hace30Dias;
    });
  }


  goTo(path : string){
    this.router.navigate([path])
  }

  //Filtra los productos cuya fecha es mayor a startDate
  onStartDateChange(): void {
    this.productosFiltered = this.productosALL.filter(producto => {
      let lastDate = '';
      for (const detail of producto.detailProducts) {
        if (detail.lastUpdatedDatetime && (!lastDate || detail.lastUpdatedDatetime > lastDate)) {
          lastDate = detail.lastUpdatedDatetime;
        }
      }
      if (!lastDate) {
        return false;
      }

      const productDate = new Date(lastDate);
      return this.startDate ? productDate >= new Date(this.startDate) : true;
    });

    this.updateDataTable();
  }

  //Filtra los productos cuya fecha es menor a startDate
  onEndDateChange(): void {
    this.productosFiltered = this.productosALL.filter(producto => {
      let lastDate = '';
      for (const detail of producto.detailProducts) {
        if (detail.lastUpdatedDatetime && (!lastDate || detail.lastUpdatedDatetime > lastDate)) {
          lastDate = detail.lastUpdatedDatetime;
        }
      }
      if (!lastDate) {
        return false;
      }

      const productDate = new Date(lastDate);
      return this.endDate ? productDate <= new Date(this.endDate) : true;
    });

    this.updateDataTable();
  }

  applyDateFilter(): void {
    this.productosFiltered = this.productosALL.filter(producto => {
      // Obtener la última fecha de actualización de los detalles del producto
    });

    this.updateDataTable();
  }

  filtersValues: any = {
    startDate: '',
    endDate: '',
  };

  globalFilter: string = '';


  //Método para filtrar productos con estado Activo e Inactivo
  stateFilter(event: Event) {
    
  }

  // Método para aplicar el filtro global.
  applyFilter(): void {
    const globalFilterLower = this.globalFilter.toLowerCase();
    this.productosFiltered = this.productosALL.filter(producto => {
      return producto.name.toLowerCase().includes(globalFilterLower.toLowerCase()) ||
        producto.category.categoryName.toLowerCase().includes(globalFilterLower.toLowerCase()) ||
        (producto.reusable ? 'SI' : 'NO').toLowerCase().includes(globalFilterLower.toLowerCase()) ||
        producto.detailProducts.length.toString().includes(globalFilterLower);
    });

    //Seccion para filtrar por fecha startDate
    this.productosFiltered = this.productosFiltered.filter(producto => {
      let lastDate = '';
      for (const detail of producto.detailProducts) {
        if (detail.lastUpdatedDatetime && (!lastDate || detail.lastUpdatedDatetime > lastDate)) {
          lastDate = detail.lastUpdatedDatetime;
        }
      }
      if (!lastDate) {
        return false;
      }

      const productDate = new Date(lastDate);
      return this.startDate ? productDate >= new Date(this.startDate) : true;
    });

    //Seccion para filtrar por fecha endDate
    this.productosFiltered = this.productosFiltered.filter(producto => {
      let lastDate = '';
      for (const detail of producto.detailProducts) {
        if (detail.lastUpdatedDatetime && (!lastDate || detail.lastUpdatedDatetime > lastDate)) {
          lastDate = detail.lastUpdatedDatetime;
        }
      }
      if (!lastDate) {
        return false;
      }

      const productDate = new Date(lastDate);
      return this.endDate ? productDate <= new Date(this.endDate) : true;
    });


    this.updateDataTable();

    console.log('Filtro global:', this.globalFilter);
    console.log('startDate:', this.startDate);
    console.log('endDate:', this.endDate);
  }

  filtersVisible = false; // Controla la visibilidad de los filtros

  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible; // Alterna la visibilidad de los filtros
    if (this.filtersVisible) {
      this.cleanFilters(); // Limpia los filtros al ocultarlos
    }
  }

  private categoriaService = inject(CategoriaService);
  private estadoService = inject(EstadoService);
  private productoService = inject(ProductService);
  private detalleProductoService = inject(DetailServiceService);
  private stockAumentoService = inject(StockAumentoService);
  private router = inject(Router);
  modalVisible: boolean = false;

  categorias$: Observable<ProductCategory[]> = new Observable<
    ProductCategory[]
  >();
  estados$: Observable<String[]> = new Observable<String[]>();

  productos$: Observable<ProductXDetailDto[]> = new Observable<
    ProductXDetailDto[]
  >();
  productosALL: any[] = [];
  productosFiltered: any[] = [];

  categoriasSubscription: Subscription | undefined;
  estadosSubscription: Subscription | undefined;
  productosSubscription: Subscription | undefined;

  categories: ProductCategory[] = [];
  estados: String[] = [];
  productos: ProductXDetailDto[] = [];
  details: Details[] = [];

  amountAvailable: number = 0;
  amountBorrowed: number = 0;
  amountBroken: number = 0;

  categoria: number = 0;
  reusable: number = 0;
  cantMinima: number | null = null;
  cantMaxima: number | null = null;
  nombre: string = '';

  requestInProcess: boolean = false;

  myMap: Record<string, number> = {
    Disponible: 0,
    Prestado: 0,
    Roto: 0,
  };
  private table: any;

  validoMin: boolean = true;
  validoMax: boolean = true;
  mensajeValidacionMin: string = '';
  mensajeValidacionMax: string = '';

  valAmount: boolean = false;
  showAumentoStockModal: boolean = false;
  showNuevoProductoModal: boolean = false;
  selectedProductId: number | null = null;


  // Variables necesarias para el filtrado por fecha
  startDate: string | undefined;
  endDate: string | undefined;



  ngOnInit(): void {
     // Mantener la inicialización de fechas existente
     const hoy = new Date();
     const hace30Dias = new Date();
     this.endDate = hoy.toISOString().split('T')[0];
     hace30Dias.setDate(hoy.getDate() - 30);
     this.startDate = hace30Dias.toISOString().split('T')[0];
     
     // Inicializar opciones para ng-select
     this.initializeNgSelectOptions();
     
     // Mantener las inicializaciones existentes
     this.initializeDataTable();
     this.cargarDatos();
     this.cargarProductos();
    //ng select 

  }

  private initializeNgSelectOptions(): void {
    // Transformar categorías al formato requerido por ng-select cuando estén disponibles
    this.categoriaService.getCategorias().subscribe(categories => {
      this.categoryOptions = categories.map(c => ({
        value: c.id,
        name: c.category
      }));
    });
  }

  onCategoryChange(): void {
    this.filters.categoriasSeleccionadas = this.selectedCategories.map(cat => cat.value);
    this.aplicarFiltrosCombinados();
  }

  onReusableChange(): void {
    this.filters.reutilizableSeleccionado = this.selectedReusables.map(r => r.value);
    this.aplicarFiltrosCombinados();
  }

  ngAfterViewInit(): void { }

  cargarProductos() {
    this.requestInProcess = true;
    this.productos$ = this.productoService.getAllProducts();
    this.productos$.subscribe({
      next: (productos) => {
        console.log(productos);
        this.productosALL = productos;
        this.filtrarPorUltimos30Dias(); // Aplica el filtro automáticamente
        this.updateDataTable(); // Actualiza la tabla con el filtro aplicado
        this.requestInProcess = false;
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('Completado');
      },
    });
  }

  cargarDatos() {
    this.categorias$ = this.categoriaService.getCategorias();
    this.categorias$.subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log(this.categories);
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('Completado');
      },
    });
    this.estados$ = this.estadoService.getEstados();
    this.estados$.subscribe({
      next: (estados) => {
        this.estados = estados;
        console.log('ESTADOS' + this.estados);
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('Completado');
      },
    });
  }

  // Modifica el método aplicarFiltros() para usar las categorías seleccionadas
  aplicarFiltros(): void {
    this.productosFiltered = this.productosALL.filter((producto) => {
      const nombreCumple =
        this.nombre === '' ||
        producto.name.toLowerCase().includes(this.nombre.toLowerCase());

      const categoriaCumple =
        this.categoriasSeleccionadas.length === 0 ||
        this.categoriasSeleccionadas.includes(producto.category.categoryId);

      const reusableCumple =
        this.reutilizableSeleccionado.length === 0 ||
        this.reutilizableSeleccionado.includes(producto.reusable ? 1 : 2);

      const amount = producto.detailProducts.length;
      const minQuantityWarningCumple =
        this.cantMinima === null || amount >= this.cantMinima;
      const maxQuantityWarningCumple =
        this.cantMaxima === null || amount <= this.cantMaxima;

      return (
        nombreCumple &&
        categoriaCumple &&
        reusableCumple &&
        minQuantityWarningCumple &&
        maxQuantityWarningCumple
      );
    });

    this.amountAvailable = this.getCountByategoryAndState(1, 'Disponible');
    this.amountBorrowed = this.getCountByategoryAndState(1, 'Prestado');
    this.amountBroken = this.getCountByategoryAndState(1, 'Roto');
    this.updateDataTable();
  }



  // Modifica el método cleanFilters() para limpiar también las categorías seleccionadas
  cleanFilters(): void {
    this.cantMaxima = null;
    this.cantMinima = null;
    this.globalFilter = '';
    this.startDate = '';
    this.endDate = '';
    this.filters = {
      categoriasSeleccionadas: [],
      reutilizableSeleccionado: [],
      nombre: '',
      startDate: '',
      endDate: '',
      cantMinima: 0,
      cantMaxima: 0
    };

    // Limpia los checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: any) => checkbox.checked = false);

    // Limpia los campos de texto
    const textInputs = document.querySelectorAll('input.form-control');
    textInputs.forEach(input => (input as HTMLInputElement).value = '');

    this.aplicarFiltrosCombinados();
  }

  getCountByategoryAndState(categoryId: number, state: string): number {
    return this.productosFiltered.reduce((count, producto) => {
      if (producto.category.categoryId === categoryId) {
        for (let i = 0; i < producto.detailProducts.length; i++) {
          if (producto.detailProducts[i].state === state) {
            count++;
          }
        }
      }
      return count;
    }, 0);
  }


  initializeDataTable(): void {
    this.table = $('#productsList').DataTable({
      dom:
        '<"mb-3"t>' +
        '<"d-flex justify-content-between"lp>',
      data: this.productosFiltered,

      columns: [
        {
          data: 'detailProducts',
          title: 'Último Ingreso', // Título más corto
          render: (data: any) => {
            let lastDate;
            for (let i = 0; i < data.length; i++) {
              if (data[i].lastUpdatedDatetime) {
                lastDate = data[i].lastUpdatedDatetime;
                if (data[i].lastUpdatedDatetime > lastDate) {
                  lastDate = data[i].lastUpdatedDatetime;
                }
              }
            }
            return lastDate ? this.formatDate(lastDate) : '';
          },
        },
        {
          data: 'reusable',
          title: 'Reutilizable',
          className: "text-center",
          render: (data: boolean) => {
            let color;
            let name;

            switch (data) {
              case true: color = "text-bg-success"; name = "Si"; break;
              case false: color = "text-bg-danger"; name = "No"; break;
            }

            return  `
            <div class=text-center">
              <div class="badge border rounded-pill ${color}">${name}</div>
            </div > `;
          },
        },
        { data: 'name', title: 'Nombre' }, // Mantiene el título corto
        {
          data: 'category',
          title: 'Categoría',
          render: (data: any) => {
            return data.categoryName;
          },
        },
        {
          data: null,
          title: 'Cantidad',
          render: (row: any) => {
            const quantity = row.detailProducts.length;

            const warning = row.minQuantityWarning;

/*             if (quantity <= warning + 10 && quantity > warning) {
              return `<span style="color: #FF8C00; font-weight: bold;">${quantity}</span>`;
            } else {
              if (9 >= quantity && quantity > 0) {
                return `<span style="color: #FF0000; font-weight: bold;">${quantity}</span>`;
              }
            } */

            return quantity;
          }
        },
        {
          data: 'minQuantityWarning',
          title: 'Min. Alerta',
        },
        {
          data: null,
          title: 'Acciones',
          className: 'align-middle',
          render: (data: any, type: any, row: any) => {
            return `
                         
            <div class="text-center">
              <div class="btn-group">
                <div class="dropdown">
                  <button type="button" class="btn border border-2 bi-three-dots-vertical btn-cambiar-estado" data-bs-toggle="dropdown"></button>
                    <ul class="dropdown-menu">
                      <li><button class="dropdown-item btn botonDetalleConsultar" data-id="${row.id}">Ver más</button></li>
                          <li class="dropdown-divider"></li>
                      <li><button class="dropdown-item btn botonAumentoStock" data-bs-target="#aumentoStock" 
                        data-bs-toggle="modal"  data-id="${row.id}">Agregar stock</button>
                      </li>
                       <!--    <li class="dropdown-divider"></li>
                      <li><button class="dropdown-item btn delete-btn" data-id="${row.id}" 
                        (click)="giveLogicalLow(${row.id})">Eliminar</button>
                      </li> -->
                    </ul>
                </div>
              </div>
            </div>`;
          },
        },
      ],
      pageLength: 5,
      lengthChange: true, // Permitir que el usuario cambie el número de filas mostradas
      lengthMenu: [5, 10, 25, 50], // Valores para el número de filas],
      searching: false,
      ordering: true,
      order: [[0, 'asc']],
      autoWidth: false, // Desactivar el ajuste automático de ancho

      language: {
        search: '',
        lengthMenu: '_MENU_', // Esto eliminará el texto "entries per page"
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        emptyTable: 'No se encontraron registros',
      },
      createdRow: function (row: any, data: any) {
        // Verifica si la cantidad es menor o igual al mínimo de alerta
        if (data.detailProducts.length <= data.minQuantityWarning) {
          // Aplicar la clase de Bootstrap para warning
        }
      },
      initComplete: () => {
        $('#Nombre').on('keyup', (event) => {
          this.nombre = $(event.currentTarget).val() as string;
          if (this.table.search() !== this.nombre) {
            this.table.search(this.nombre).draw();
          }
        });
      },

    });
    // Corregir los event handlers
    $('#productsList').on('click', '.botonAumentoStock', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const id = $(event.currentTarget).data('id');
      this.abrirModalAumentoStock(id);
    });

    $('#productsList').on('click', '.botonDetalleConsultar', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const id = $(event.currentTarget).data('id');
      this.irDetalles(id);
    });

    $('#productsList').on('click', '.botonDetalleCrear', (event) => {
      const id = $(event.currentTarget).data('id');
      this.irAgregarDetalles(id);
    });

    $('#productsList').on('click', '.delete-btn', (event) => {
      event.preventDefault();
      const id = $(event.currentTarget).data('id');
      this.setProductToDelete(id);
      this.showConfirmDeleteModal();
    });

  }

  setProductToDelete(id: number): void {
    console.log('Eliminando producto con id: ' + id);
    this.selectedProductId = id;
  }

  showConfirmDeleteModal(): void {
    Swal.fire({
      title: '¿Estás seguro de eliminar este producto?',
      text: 'Se darán de baja todos sus ítems asociados',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545', // Color rojo de Bootstrap
      cancelButtonColor: '#6c757d', // Color gris de Bootstrap
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteProduct();
      }
    });
  }

  showErrorDeleteModal(): void {
    Swal.fire({
      title: 'Error al eliminar el producto',
      text: 'No se pudo eliminar el producto',
      icon: 'error',
      confirmButtonText: 'Aceptar',
    });
  }

  showSuccessDeleteModal(): void {
    Swal.fire({
      title: 'Producto eliminado',
      text: 'El producto ha sido eliminado correctamente',
      icon: 'success',
      confirmButtonText: 'Aceptar',
    });
  }

  deleteProduct(): void {
    console.log('Eliminando producto');
    if (this.selectedProductId !== null) {
      const logicalLow$ = this.productoService.giveLogicalLow(this.selectedProductId);
      logicalLow$.subscribe({
        next: (response) => {
          console.log(response);
          this.showSuccessDeleteModal();
          this.cargarProductos();
        },
        error: (error) => {
          this.handleErrorMessage(error);
          console.error(error);
        },
        complete: () => {
          console.log('Petición completada');
        },
      });
    } else {
      console.log('No se ha seleccionado un producto');
      this.showErrorDeleteModal();
    }
  }

  handleErrorMessage(error: any): void {
    console.error(error);
    if (error.error.message === '404 Product not found') {
      this.errorMessage = 'El producto no fue encontrado';
    }
    this.showErrorDeleteModal();
  }

  giveLogicalLow(id: number) {
    console.log('Eliminando producto con id: ' + id);
  }

  /* METODO PARA PASAR DE FECHAS "2024-10-17" A FORMATO dd/mm/yyyy*/
  formatDate(inputDate: string): string {
    const [year, month, day] = inputDate.split('-');
    return `${day}/${month}/${year}`;
  }

  updateDataTable(): void {
    if (this.table) {
      this.table.clear().rows.add(this.productosFiltered).draw();
    }
  }


  getFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes desde 0
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
  }

  generarPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Productos', 10, 10);

    // Reordenamos los datos según el orden de columnas en la tabla HTML
    const dataToExport = this.productosFiltered.map((producto) => [
      producto.detailProducts
        ? this.getLastIngreso(producto.detailProducts)
        : '', // Último ingreso
      producto.name, // Nombre
      producto.category ? producto.category.categoryName : '', // Categoría
      producto.reusable ? 'SI' : 'NO', // Reutilizable
      producto.detailProducts ? producto.detailProducts.length : 0, // Cantidad
      producto.minQuantityWarning || '', // Min. Alerta
    ]);

    // Orden de encabezados de columnas según la tabla HTML
    (doc as any).autoTable({
      head: [
        [
          'Último ingreso',
          'Nombre',
          'Categoría',
          'Reutilizable',
          'Cantidad',
          'Min. Alerta',
        ],
      ],
      body: dataToExport,
      startY: 30,
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
    });

    // Guardar archivo PDF
    const formattedDate = this.getFormattedDate();
    doc.save(`${formattedDate}_Lista_Productos.pdf`);
  }

  // Método auxiliar para obtener la última fecha de ingreso
  getLastIngreso(detailProducts: any[]): string {
    let lastDate = '';
    for (let i = 0; i < detailProducts.length; i++) {
      if (detailProducts[i].lastUpdatedDatetime) {
        if (!lastDate || detailProducts[i].lastUpdatedDatetime > lastDate) {
          lastDate = detailProducts[i].lastUpdatedDatetime;
        }
      }
    }
    return lastDate ? this.formatDate(lastDate) : '';
  }

  generarExcel(): void {
    const encabezado = [
      ['Listado de Productos'],
      [],
      ['Último Ingreso', 'Nombre', 'Categoría', 'Reutilizable', 'Cantidad', 'Min. Alerta']
    ];

    // Reordenamos los datos según el orden de columnas en la tabla HTML
    const excelData = this.productosFiltered.map((producto) => [
      producto.detailProducts
        ? this.getLastIngreso(producto.detailProducts)
        : '',
      producto.name,
      producto.category ? producto.category.categoryName : '',
      producto.reusable ? 'SI' : 'NO',
      producto.detailProducts ? producto.detailProducts.length : 0,
      producto.minQuantityWarning || '',
    ]);

    const worksheetData = [...encabezado, ...excelData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 }
    ];

    // Crear el libro de trabajo y agregar la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Productos');

    // Guardar el archivo con la fecha
    const formattedDate = this.getFormattedDate();
    XLSX.writeFile(workbook, `${formattedDate}_Lista_Productos.xlsx`);
  }

  irMenu() {
    this.router.navigate(['']);
  }

  irDetalles(id: number) {
    this.detalleProductoService.setId(id);
    this.router.navigate(['home/inventory-detail']);
  }



  irAgregarProducto() {
    /* this.modalVisible = true; // Muestra el modal */
    this.router.navigate(["home/new-product"])
  }

  verificarMin(): boolean {
    if (this.cantMinima === null) {
      this.mensajeValidacionMin = '';
      return true;
    }

    if (this.cantMinima < 0) {
      this.mensajeValidacionMin = 'El número no puede ser menor a cero';
      return false;
    }

    if (this.cantMaxima !== null && this.cantMinima > this.cantMaxima) {
      this.mensajeValidacionMin = 'La cantidad mínima no puede ser mayor a la cantidad máxima';
      return false;
    }

    this.mensajeValidacionMin = '';
    return true;
  }

  verificarMax(): boolean {
    if (this.cantMaxima === null) {
      this.mensajeValidacionMax = '';
      return true;
    }

    if (this.cantMaxima < 0) {
      this.mensajeValidacionMax = 'No puedes poner un número menor a cero';
      return false;
    }

    this.mensajeValidacionMax = '';
    return true;
  }

  ngOnDestroy(): void {
    if (this.categoriasSubscription) {
      this.categoriasSubscription.unsubscribe();
    }
    if (this.estadosSubscription) {
      this.estadosSubscription.unsubscribe();
    }
    if (this.productosSubscription) {
      this.productosSubscription.unsubscribe();
    }
    this.showAumentoStockModal = false;
    this.selectedProductId = null;
  }

  // Agregar método para recargar la tabla después de aumentar el stock
  recargarDespuesDeAumentoStock() {
    this.cargarProductos();
    this.cerrarModalAumentoStock();
  }

  abrirModalAumentoStock(productId: number) {
    this.selectedProductId = productId;
    this.showAumentoStockModal = true;
    this.modalVisible = false; // Asegurarse que el otro modal esté cerrado
    this.stockAumentoService.setId(productId);
  }

  cerrarModalAumentoStock() {
    this.showAumentoStockModal = false;
    this.selectedProductId = null;
  }

  abrirModal() {
    this.modalVisible = true;
    this.showAumentoStockModal = false; // Asegurarse que el otro modal esté cerrado
  }

  cerrarModal() {
    this.modalVisible = false;
  }


  irAgregarDetalles(id: number) {
    this.stockAumentoService.setId(id);
    this.abrirModalAumentoStock(id);
  }

  // Nombre del producto para el título del modal
  nombreProducto: string = ''; // Puedes cargar esto dinámicamente
  selectedProveedor: any;

  // Opciones para el proveedor en el ng-select
  proveedorOptions = [
    { id: 1, nombre: 'Proveedor A' },
    { id: 2, nombre: 'Proveedor B' },
    { id: 3, nombre: 'Proveedor C' }
  ];



  // Método para abrir el modal
  openAumentoStockModal(nombreProducto: string) {
    this.nombreProducto = nombreProducto;
    this.showAumentoStockModal = true;
  }

  // Método para cerrar el modal y limpiar el fondo negro
  closeAumentoStockModal() {
    const modalElement = document.getElementById('aumentoStock'); // Cambia 'aumentoStock' por el ID de tu modal
  if (modalElement) {
    // Obtener instancia del modal de Bootstrap
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide(); // Oculta el modal usando Bootstrap
    }
    
    // Limpieza completa del modal
    setTimeout(() => {
      // Remover clases del body relacionadas con el modal
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
      document.body.style.removeProperty('overflow');

      // Remover los elementos backdrops
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());

      // Limpiar los atributos y estilos del modal para ocultarlo
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.removeAttribute('aria-modal');
      modalElement.removeAttribute('role');

      // Remover cualquier estilo inline que pueda haber quedado
      const allModals = document.querySelectorAll('.modal');
      allModals.forEach(modal => {
        (modal as HTMLElement).style.display = 'none';
      });
    }, 100); // Esperar un momento para asegurarse de que Bootstrap haya terminado de ocultar el modal
  }
  }

  // Método para manejar el clic en el fondo del modal
  handleModalBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeAumentoStockModal();
    }
  }

  // Método para mostrar el mensaje de éxito con SweetAlert
  onStockIncreaseSuccess() {
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Aumento de stock registrado con éxito.',
      confirmButtonColor: '#28a745' // Verde para el botón
    }).then(() => {
      this.closeAumentoStockModal(); // Cierra el modal después de mostrar el mensaje
    });
  }
}

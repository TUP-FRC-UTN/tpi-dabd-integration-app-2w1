import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import { Details, PostDecrement } from '../../models/details';
declare var bootstrap: any;
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { EmpListadoEmpleados } from '../../../iep-employees/Models/emp-listado-empleados';
import { EmpListadoEmpleadosService } from '../../../iep-employees/services/emp-listado-empleados.service';
import { WarehouseMovementService } from '../../services/warehouse-movement.service';
import { catchError, delay, min, Observable } from 'rxjs';
import { IepCreateWarehouseMovementDTO } from '../../models/iep-create-warehouse-movement-dto';
import { DetailServiceService } from '../../services/detail-service.service';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-iep-detail-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './iep-detail-table.component.html',
  styleUrls: ['./iep-detail-table.component.css'],
})
export class IepDetailTableComponent implements OnInit, OnDestroy {

  selectedStates: string[] = []; // Cambia de string a array

  minPrice: number | null = null;
  maxPrice: number | null = null;
  priceValidationError: boolean = false;

  stateOptions = [
    { id: 'Disponible', label: 'Disponible' },
    { id: 'Mantenimiento', label: 'Mantenimiento' },
    { id: 'Prestado', label: 'Prestado' }
  ];
  

  // Método para aplicar filtro por estados seleccionados
  applyStateFilter($event: Event, state: string) {
    const checkbox = $event.target as HTMLInputElement;

    if (checkbox.checked) {
      // Añadir estado si está marcado
      this.selectedStates.push(state);
    } else {
      // Remover estado si está desmarcado
      const index = this.selectedStates.indexOf(state);
      if (index > -1) {
        this.selectedStates.splice(index, 1);
      }
    }
    console.log(this.selectedStates.length);
    this.applyAllFilters();
  }
  // Método para limpiar todos los filtros
  cleanColumnFilters(): void {
    // Limpiar estados seleccionados
    this.selectedStates = [];

    // Desmarcar todos los checkboxes del dropdown de estado
    const stateCheckboxes = document.querySelectorAll('input[name="estado"]') as NodeListOf<HTMLInputElement>;
    stateCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });

    // Limpiar el texto seleccionado en el botón del dropdown
    const selectedStateSpan = document.querySelector('.selected-state') as HTMLSpanElement;
    if (selectedStateSpan) {
      selectedStateSpan.textContent = '';
    }

    // Limpiar valores de los inputs
    const inputs = document.querySelectorAll('input[placeholder]');
    inputs.forEach(input => (input as HTMLInputElement).value = '');



    // Resetear select de estado
    const estadoSelect = document.getElementById('estadoSelect') as HTMLSelectElement;
    if (estadoSelect) {
      estadoSelect.value = '';
    }

    // Resetear variables de precio
    this.minPrice = null;
    this.maxPrice = null;
    this.priceValidationError = false;

    // Limpiar los inputs de precio
    const minPriceInput = document.getElementById('precioMin') as HTMLInputElement;
    const maxPriceInput = document.getElementById('precioMax') as HTMLInputElement;
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';

    // Resetear la lista filtrada a todos los elementos
    this.filteredDetails = [...this.details];

    // Actualizar la tabla
    this.table.clear().rows.add(this.filteredDetails).draw();
  }

  filtersVisible: boolean = false;
  filteredDetails: Details[] = []; // Nueva lista para elementos filtrados  
  selectedState: string = ''; // Método para aplicar filtro por estado




  // Método para aplicar todos los filtros
public applyAllFilters(): void {
  this.filteredDetails = this.details.filter(detail => {
    // Filtro de búsqueda general
    const searchTerm = this.currentSearchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      detail.description.toLowerCase().includes(searchTerm) ||
      detail.supplierName.toLowerCase().includes(searchTerm) ||
      detail.state.toLowerCase().includes(searchTerm);

    // Filtro por estado - ng-select maneja automáticamente los estados seleccionados
    const matchesState = this.selectedStates.length === 0 ||
      this.selectedStates.includes(detail.state);

    // Filtro por precio
    const matchesPrice = this.applyPriceFilterLogic(detail.price);

    // Filtros por columnas específicas
    const productFilter = (document.querySelector('input[placeholder="Descripción"]') as HTMLInputElement)?.value.toLowerCase();
    const supplierFilter = (document.querySelector('input[placeholder="Proveedor"]') as HTMLInputElement)?.value.toLowerCase();

    const matchesProduct = !productFilter || detail.description.toLowerCase().includes(productFilter);
    const matchesSupplier = !supplierFilter || detail.supplierName.toLowerCase().includes(supplierFilter);

    // Retorna true solo si cumple con todos los filtros
    return matchesSearch && matchesState && matchesPrice && matchesProduct && matchesSupplier;
  });

  // Actualizar la tabla con los resultados filtrados
  this.table.clear().rows.add(this.filteredDetails).draw();
}
  // Método para validar precios
  validatePrices(min: number | null, max: number | null): boolean {
    if (min !== null && max !== null) {
      if (min > max) {
        this.priceValidationError = true;
        return false;
      }
    }
    this.priceValidationError = false;
    return true;
  }

  applyPriceFilter2(event: Event, type: 'min' | 'max'): void {
    const value = (event.target as HTMLInputElement).value;
    const numValue = value ? Number(value) : null;

    if (type === 'min') {
      this.minPrice = numValue;
      // Validar si el precio mínimo es mayor que el máximo actual
      if (this.maxPrice !== null && numValue !== null && numValue > this.maxPrice) {
        this.priceValidationError = true;
        return;
      }
    } else {
      this.maxPrice = numValue;
      // Validar si el precio máximo es menor que el mínimo actual
      if (this.minPrice !== null && numValue !== null && numValue < this.minPrice) {
        this.priceValidationError = true;
        return;
      }
    }

    this.priceValidationError = false;
    this.applyAllFilters();
  }

  cleanStateFilters(): void {
    this.selectedStates = [];
    const checkboxes = document.querySelectorAll('input[name="estado"]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(checkbox => checkbox.checked = false);
    this.applyAllFilters();
  }

  // Método para aplicar filtro por rango de precio
  applyPriceFilter(type: 'min' | 'max', event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    if (type === 'min') {
      this.minPrice = value ? Number(value) : null;
    } else {
      this.maxPrice = value ? Number(value) : null;
    }

    this.applyAllFilters();
  }

  // Método para aplicar filtro por columna
  applyColumnFilter(event: Event, column: string): void {
    this.applyAllFilters();
  }



  // Método auxiliar para aplicar la lógica del filtro de precio
  private applyPriceFilterLogic(price: number): boolean {
    if (price < 0) {
      return false;
    }

    if (this.priceValidationError) {
      return false;
    }


    const minPriceMatch = this.minPrice === null || price >= this.minPrice;
    const maxPriceMatch = this.maxPrice === null || price <= this.maxPrice;
    return minPriceMatch && maxPriceMatch;
  }

  details: Details[] = [];
  private table: any;
  justificativo: string = '';
  selectedIds: number[] = [];
  private deleteModal: any;
  currentSearchTerm: string = ''; // Almacena el término de búsqueda actual

  //////
  idUser: number = 1;
  reincorporationDate = false;
  selectedDetailstoShow: Details[] = [];
  loading: boolean = false;
  confirmPost: boolean = false;
  employees: EmpListadoEmpleados[] = [];
  dtoCreate: IepCreateWarehouseMovementDTO = new IepCreateWarehouseMovementDTO();
  createMovement$: Observable<any> = new Observable<any>();
  errorMessage: string | undefined;
  errorPost: boolean = false;
  optionsToMovement: string[] = [];


  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible; // Alterna la visibilidad de los filtros
  }

  private formatDateForInput(date: Date): Date {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Create a new date object with local timezone
    const formattedDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}`);
    return formattedDate;
  }



  constructor(private detailService: DetailServiceService,
    private employeesService: EmpListadoEmpleadosService,
    private warehouseService: WarehouseMovementService,
    private router: Router
  ) { }

  estados: string[] = [];

  //Método para aplicar filtro por estado para usar los estados seleccionados




  changeSelectEmployees(): void {
    console.log('Empleado seleccionado:', this.dtoCreate.employee_id);
    this.dtoCreate.applicant = this.employees.find(emp => emp.id === this.dtoCreate.employee_id)?.fullName;
  }

  loadEmployees(): void {
    this.employeesService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        console.log('Empleados cargados con éxito:', data);
      },
      error: (err) => {
        console.error('Error al cargar empleados:', err);
      },
    });
  }

  showErrorWarehouseAlert(): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: this.errorMessage,
      confirmButtonText: 'Intentar de nuevo'
    }).then(() => {
      this.cleanDTO();
      this.closeModal();
    });
  }

  showSuccessWarehouseAlert(): void {
    Swal.fire({
      icon: 'success',
      title: 'Movimiento registrado',
      text: 'El movimiento de almacén se ha registrado con éxito',
      confirmButtonText: 'OK'

    }).then(() => {
      this.cleanDTO();
      this.closeModal();
    });
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      console.log("Formulario inválido");
      return;
    }

    this.loading = true;
    this.confirmPost = false;
    this.errorPost = false;
    this.errorMessage = '';

    this.dtoCreate.id_details = this.selectedIds;
    this.dtoCreate.responsible = 'Encargado de Inventario';

    this.warehouseService.postWarehouseMovement(this.dtoCreate, this.idUser)
      .subscribe({
        next: (response) => {
          console.log('Movimiento de almacén registrado con éxito:', response);
          this.showSuccessWarehouseAlert();
          this.confirmPost = true;
        },
        error: (err) => {
          console.error('Error al registrar movimiento de almacén:', err);
          this.errorPost = true;

          // Manejar diferentes tipos de error
          this.handleError(err);
        },
        complete: () => {
          console.log('Petición completada');
          this.loading = false;
        }
      });

  }

  handleError(err: any): void {
    switch (err.error.message) {
      case "Required request parameter 'idLastUpdatedUser' for method parameter type Integer is not present":
        this.errorMessage = 'No se ha especificado el usuario que realiza el movimiento';
        break;
      case "404 Item not available to loan":
        this.errorMessage = 'El producto no está disponible para préstamo';
        break;
      case "404 Item already available":
        this.errorMessage = 'El producto ya está disponible';
        break;
      case "404 Item already in maintenance":
        this.errorMessage = 'El producto ya está en mantenimiento';
        break;
      case "404 Item not found":
        this.errorMessage = 'Producto no encontrado';
        break;
      case "500 Error creating warehouse movement":
        this.errorMessage = 'Error al crear el movimiento de almacén';
        break;
      case "400 Invalid movement type":
        this.errorMessage = 'Tipo de movimiento inválido';
        break;
      case "404 Employee not found":
        this.errorMessage = 'Error al crear el movimiento de almacén';
        break;
      case "400 Applicant required":
        this.errorMessage = 'El solicitante es requerido';
        break;
      case "400 Item discontinued":
        this.errorMessage = 'El producto seleccionado fue dado de baja';
        break;
      default:
        this.errorMessage = 'Error al procesar la solicitud';
    }
    this.showErrorWarehouseAlert();

  }

  /*private closeModal() {
    const modalElement = document.getElementById('warehouseModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
      
      // Limpieza completa después de que se oculte el modal
      setTimeout(() => {
        // Remover clases del body
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        document.body.style.removeProperty('overflow');
        
        // Remover todos los backdrops
        const backdrops = document.getElementsByClassName('modal-backdrop');
        while (backdrops.length > 0) {
          backdrops[0].remove();
        }
  
        // Limpiar el modal
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
        modalElement.removeAttribute('role');
      }, 300);
    }
  }*/

  private closeModal() {
    const modalElement = document.getElementById('warehouseModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }

      // Limpieza completa después de que se oculte el modal
      setTimeout(() => {
        // Remover clases del body
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        document.body.style.removeProperty('overflow');

        // Remover todos los backdrops
        const backdrops = document.getElementsByClassName('modal-backdrop');
        while (backdrops.length > 0) {
          backdrops[0].remove();
        }

        // Limpiar el modal
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
        modalElement.removeAttribute('role');
      }, 300);
    }
  }


  cleanDTO(): void {
    this.dtoCreate = new IepCreateWarehouseMovementDTO();
    this.dtoCreate.date = new Date().toISOString().slice(0, 16);
    this.dtoCreate.reinstatement_datetime = new Date().toISOString().slice(0, 16);
    this.dtoCreate.id_details = [];
    this.dtoCreate.employee_id = 0;
    this.dtoCreate.applicant = '';
    this.toggleSelectAll({ target: { checked: false } });
    this.confirmPost = false;
    this.optionsToMovement = [];
    this.selectedIds = [];
    this.loadDetails();
  }



  onChangeEmployee(): void {
    var applicantString;
    for (let i = 0; i < this.employees.length; i++) {
      if (this.employees[i].id == this.dtoCreate.employee_id) {
        applicantString = this.employees[i].fullName;
      }
    }
    this.dtoCreate.applicant = applicantString;
  }




  ngOnInit(): void {
    this.loadDetails();
    this.loadEmployees();
    this.initializeModal();
    this.dtoCreate.date = new Date().toISOString().slice(0, 16);
    this.dtoCreate.reinstatement_datetime = new Date().toISOString().slice(0, 16);
    this.dtoCreate.id_details = [];
    this.dtoCreate.employee_id = undefined;
    this.dtoCreate.applicant = '';
    this.dtoCreate.responsible = 'Encargado de Inventario';
    const modalElement = document.getElementById('warehouseModal');
    const modalDeleteElement = document.getElementById('confirmDeleteModal');
    // Agregar listener para clics en el backdrop
    document.addEventListener('click', (event: any) => {
      if (event.target === modalElement || event.target === modalDeleteElement) {
        // El clic fue en el backdrop
        console.log('Clic en el backdrop');
        this.confirmPost = false;
        this.cleanDTO();
        // o cualquier otro método
      }
    });

  }



  public openModalWarehouse() {
    const modalElement = document.getElementById('warehouseModal');
    if (!modalElement) return;

    // Asegurarnos de que no exista una instancia previa
    let modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.dispose();
    }

    // Crear nueva instancia y mostrar
    modalInstance = new bootstrap.Modal(modalElement, {
      backdrop: 'static', // Esto evita que se cierre al hacer clic fuera
      keyboard: false,
      backdropClassName: 'darker-backdrop' // Clase personalizada para el backdrop
    });

    modalInstance.show();
  }


  initializeModal(): void {
    this.deleteModal = new bootstrap.Modal(
      document.getElementById('confirmDeleteModal')
    );
  }

  loadDetails(): void {

    this.detailService.getDetails().subscribe({
      next: (details) => {
        if (this.details.length == 0) {
          this.details = details;
          this.filteredDetails = details;
          this.initializeDataTable();
        } else {
          this.details = details;
          this.filteredDetails = details;
          this.updateDataTable();
        }
        // Inicializa el filtro con todos los elementos
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
      },
    });
  }

  applyFilter(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredDetails = this.details.filter(detail =>
      detail.description.toLowerCase().includes(searchTerm) ||
      detail.supplierName.toLowerCase().includes(searchTerm) ||
      detail.state.toLowerCase().includes(searchTerm)
    );

    this.currentSearchTerm = event.target.value.toLowerCase();
    // this.applyStateFilter({ target: { value: (document.getElementById('estadoSelect') as HTMLSelectElement).value } });
    this.applyStateFilter({ target: { value: this.selectedState } } as unknown as Event, this.selectedState);

    this.table.clear().rows.add(this.filteredDetails).draw(); // Actualiza la tabla con los elementos filtrados
  }

  updateDataTable(): void {
    this.table.clear().rows.add(this.filteredDetails).draw();
  }

  initializeDataTable(): void {
    if (this.table) {
      this.table.destroy();
      $('#productTable').empty();
    }

    this.table = $('#productTable').DataTable({
      dom:
        '<"mb-3"t>' +
        '<"d-flex justify-content-between"lp>',
      //dom: '<"d-flex justify-content-between align-items-center mb-3"<"d-flex align-items-center gap-2"f><"select-all-wrapper">>rt<"d-flex justify-content-end"p>',
      //dom: '<"d-flex justify-content-between align-items-center mb-3"f<"select-all-wrapper">>rt<"d-flex justify-content-end"p>', // Paginación a la derecha
      /*       layout: {
              topStart: 'search',
              topEnd: null
            }, */
      data: this.filteredDetails, // Cambia `details` a `filteredDetails`
      columns: [
        {
          data: 'state',
          className: "text-center",
          title: 'Estado',
          render: (data: string) => {
            let colorClass;
            switch (data) {
              case 'Disponible':
                return `<span class="badge" style = "background-color: #0d6efd;" > Disponible </span>`;
              case 'Mantenimiento':
                return `<span class="badge" style = "background-color: #ffc107;" > Mantenimiento </span>`;
              case 'Prestado':
                return `<span class="badge" style = "background-color: #dc3545;" > Prestado </span>`;
              default:
                return data;
            }
          }
        },
        { data: 'description', title: 'Descripción' },
        { data: 'supplierName', title: 'Nombre del Proveedor' },
        {
          data: 'price',
          title: 'Precio',
          className: 'text-end',
          render: (data: number) => {
            let formattedAmount = new Intl.NumberFormat('es-AR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(data);
            return `<div>$ ${formattedAmount} </div>`;
          }
          ,
        },
        {
          data: null,
          title: 'Seleccionar',
          className: 'text-center',
          render: (data: any) => {
            const isChecked = this.selectedIds.includes(data.id)
              ? 'checked'
              : '';
            return `<input type="checkbox" class="form-check-input selection-checkbox" data-id="${data.id}" ${isChecked} />`;
          },
        },
      ],
      pageLength: 5,
      lengthChange: true, // Permitir que el usuario cambie el número de filas mostradas
      lengthMenu: [ // Opciones para el menú desplegable de longitud
        [5, 10, 25, 50], // Valores para el número de filas
        [5, 10, 25, 50] // Etiquetas para el número de filas
      ],
      searching: false, // Desactivar la búsqueda
      language: {
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        emptyTable: 'No se encontraron productos', // Mensaje personalizado si no hay datos   
        lengthMenu: '_MENU_', // Etiqueta para el menú de longitud
      },
      initComplete: function () {
        // Agregar el checkbox "Seleccionar todos" después de que DataTable se inicialice
        $('.select-all-wrapper').html(`
          <div class="form-check ms-3">
            <input class="form-check-input" type="checkbox" id="selectAll">
            <label class="form-check-label" for="selectAll">
              Seleccionar todos
            </label>
          </div>
        `);
      }
    });

    // Agregar el evento al checkbox después de que se cree
    $(document).on('change', '#selectAll', (event) => {
      this.toggleSelectAll(event);
    });

    $('#productTable').on('change', '.selection-checkbox', (event) => {
      const checkbox = event.target as HTMLInputElement;
      const id = parseInt(checkbox.getAttribute('data-id') || '0', 10);
      this.toggleSelection(id);
    });

    // Actualizar checkboxes cuando cambia la página
    this.table.on('draw', () => {
      this.updateCheckboxStates();
      // Actualizar el estado del checkbox "Seleccionar todos"
      const selectAllCheckbox = document.getElementById('selectAll') as HTMLInputElement;
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = this.areAllSelected();
      }
    });
  }

  // Nuevo método para actualizar el estado visual de los checkboxes
  updateCheckboxStates(): void {
    $('.selection-checkbox').each((index: number, element: HTMLElement) => {
      const checkbox = element as HTMLInputElement;
      const id = parseInt(checkbox.getAttribute('data-id') || '0', 10);
      checkbox.checked = this.selectedIds.includes(id);
    });
  }

  areAllSelected(): boolean {
    return (
      this.details.length > 0 && this.selectedIds.length === this.details.length
    );
  }

  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selectedIds = this.details.map((detail) => detail.id);
    } else {
      this.selectedIds = [];
    }
    // Actualizar los checkboxes visualmente
    this.updateCheckboxStates();
  }

  toggleSelection(id: number): void {
    const index = this.selectedIds.indexOf(id);
    if (index > -1) {
      this.selectedIds.splice(index, 1);
    } else {
      this.selectedIds.push(id);
    }
  }

  showSuccessDeleteAlert(): void {
    Swal.fire({
      icon: 'success',
      title: 'Productos eliminados',
      text: 'Los productos se han eliminado con éxito',
      confirmButtonText: 'OK'
    });
  }

  showErrorDeleteAlert(): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al eliminar productos',
      confirmButtonText: 'Intentar de nuevo'
    });
  }

  confirmDelete(): void {
    if (this.selectedIds.length > 0 && this.justificativo.trim() !== '') {
      const postDecrement: PostDecrement = {
        justify: this.justificativo,
        ids: this.selectedIds,
      };

      this.detailService.postDecrement(postDecrement).subscribe({
        next: (response) => {
          console.log('Productos eliminados con éxito:', response);
          this.showSuccessDeleteAlert();
          // Primero ocultamos el modal
          this.deleteModal.hide();
          // Removemos manualmente el backdrop y las clases modal-open
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
          // Luego recargamos los datos y reseteamos
          this.loadDetails();
          this.resetSelectionAndJustification();
        },
        error: (err) => {
          console.error(err);
          if (err.error.text === 'Operation successful') {
            this.showSuccessDeleteAlert();
            this.deleteModal.hide();
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
              backdrop.remove();
            }
            this.loadDetails();
            this.resetSelectionAndJustification();
          } else {
            this.showErrorDeleteAlert();
            // Misma limpieza en caso de error
            this.deleteModal.hide();
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
              backdrop.remove();
            }
            this.loadDetails();
            this.resetSelectionAndJustification();
          }
        },
      });
    }
  }

  resetSelectionAndJustification(): void {
    this.selectedIds = [];
    this.justificativo = '';
    // Actualizar el estado visual de los checkboxes
    this.updateCheckboxStates();
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }

  volverInventario(): void {
    // Implementa la lógica para volver al inventario
    this.router.navigate(["home/inventory"])
  }

  getFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes desde 0
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}/${month}/${year}`;
  }

  generateExcel(): void {
    const encabezado = [
      ['Listado de Detalles de Productos'],
      [],
      ['Estado', 'Descripción', 'Nombre del Proveedor', 'Precio']
    ];

    // Datos a exportar
    const excelData = this.details.map(detail => [
      detail.state,
      detail.description,
      detail.supplierName,
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(detail.price),
    ]);

    const worksheetData = [...encabezado, ...excelData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
    ];

    // Crear el libro de trabajo y agregar la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalles de Productos');

    // Guardar el archivo con la fecha
    const formattedDate = this.getFormattedDate();
    XLSX.writeFile(workbook, `${formattedDate}_Detalle_Inventario.xlsx`);
}


  // Método para exportar a PDF
  generatePDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Listado de Inventario (Detalle)', 10, 10);

    const dataToExport = this.details.map(detail => [
      detail.state,
      detail.description,
      detail.supplierName,
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(detail.price),
    ]);

    // Añadir la tabla al PDF
    (doc as any).autoTable({
      head: [['Estado', 'Descripción', 'Nombre del Proveedor', 'Precio']],
      body: dataToExport,
      startY: 30,
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
    });

    // Guardar el PDF
    const formattedDate = this.getFormattedDate();
    doc.save(`${formattedDate}_Detalle_Inventario.pdf`);
  }

}

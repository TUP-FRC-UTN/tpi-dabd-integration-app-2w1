import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { FormsModule, NgSelectOption } from '@angular/forms';

import { EmpListadoEmpleados } from '../../Models/emp-listado-empleados';
import { EmpListadoAsistencias } from '../../Models/emp-listado-asistencias';
import { EmployeePerformance } from '../../Models/listado-desempeño';
import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service';
import { ListadoDesempeñoService } from '../../services/listado-desempeño.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';

declare var $: any;
declare var DataTable: any;

// Interfaz para los filtros
interface EmployeeFilters {
  apellidoNombre: string;
  position: string; // Cargo del empleado
  documento: string;
  salarioMin: number;
  salarioMax: number;
}

@Component({
  selector: 'app-iep-list-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './iep-list-employees.component.html',
  styleUrls: ['./iep-list-employees.component.css'],
})
export class IepListEmployeesComponent implements OnInit, OnDestroy {

  stateOptions =[
    { id: 'Activo', label: 'Activo' },
    { id: 'Inactivo', label: 'Inactivo' },
    { id: 'Licencia', label: 'Licencia' }
  ];

  onStateChange(selectedItems: any[]): void {
    this.selectedState = selectedItems ? selectedItems.map(item => item.id) : [];
    this.applyFilters();
  }

  applyFilters(): void {
    if (!this.table) return;

    this.table.clear();

    const filteredData = this.Empleados.filter(empleado => {
      // Filtro por apellido y nombre
      const nameMatch = !this.filters.apellidoNombre ||
        empleado.fullName.toLowerCase().includes(this.filters.apellidoNombre.toLowerCase());

      // Filtro por documento
      const documentMatch = !this.filters.documento ||
        empleado.document.toString().toLowerCase().includes(this.filters.documento.toLowerCase());

      // Filtro por rango de salario
      const salaryMatch = empleado.salary >= this.filters.salarioMin &&
        empleado.salary <= this.filters.salarioMax;

      // Filtro de búsqueda general (searchFilter)
      const searchTerms = this.searchFilter ? this.searchFilter.toLowerCase().split(' ') : [];
      const searchMatch = !this.searchFilter || searchTerms.every(term =>
        empleado.fullName.toLowerCase().includes(term) ||
        empleado.document.toString().toLowerCase().includes(term) ||
        empleado.salary.toString().includes(term)
      );

      // Filtro por posición
    const positionMatch = this.selectedPositions.length === 0 ||
    this.selectedPositions.includes(empleado.position);

  // Filtrar por estado
  const stateMatch = this.selectedState.length === 0 ||
    this.selectedState.includes(empleado.active ? empleado.license ? 'Licencia' : 'Activo' : 'Inactivo');

  // Aplicar todos los filtros en conjunto
  return nameMatch && documentMatch && salaryMatch && searchMatch && positionMatch && stateMatch;
});

this.table.rows.add(filteredData).draw();
  }

  private filters: EmployeeFilters = {
    apellidoNombre: '',
    position: '', // Cargo del empleado
    documento: '',
    salarioMin: 0,
    salarioMax: Number.MAX_VALUE,
  };

  applyColumnFilter(event: Event, field: string): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();

    if (field === 'apellidoNombre') {
      this.filters.apellidoNombre = value;
    } else if (field === 'documento') {
      this.filters.documento = value;
    }

    this.applyFilters();
  }

  salarioMin: number | null = null;
  salarioMax: number | null = null;
  errorMessage: string | null = null;

  validacionSalario(): boolean {
    if (this.salarioMin === null || this.salarioMax === null) {
      return false;
    }
    if (this.salarioMin > this.salarioMax) {
      this.errorMessage =
        'El salario mínimo no puede ser mayor al salario máximo';
    } else {
      this.errorMessage = null;
    }
    return this.salarioMin <= this.salarioMax;
  }

  //validacion de salario no negativo, tanto minimo como maximo

  applyAmountFilter(type: string, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value) || 0;

    if (type === 'min') {
      this.filters.salarioMin = value;
      this.applyFilters();
    } else if (type === 'max') {
      this.filters.salarioMax = value || Number.MAX_VALUE;
      this.applyFilters();
    }

    //Validar que el salario minimo no sea mayor al salario maximo, en caso de serlo, mostrar mensaje de error
    if (!this.validacionSalario()) {
      return;
    }

    this.applyFilters();
  }

  apellidoNombre: string = '';
  documento: string = '';

  cleanColumnFilters(): void {
    // Limpiar los valores de los filtros
    this.filters = {
      apellidoNombre: '',
      position: '', // Cargo del empleado
      documento: '',
      salarioMin: 0,
      salarioMax: Number.MAX_VALUE,
    };

    this.documento = '';
    this.apellidoNombre = '';
    this.salarioMin = null;
    this.salarioMax = null;
    this.errorMessage = null;

    // Limpia los estados seleccionados
    this.selectedState = [];

    // Limpiar las posiciones seleccionadas
    this.selectedPositions = [];

    // Limpiar los inputs
    const inputs = document.querySelectorAll(
      '.filtros input'
    ) as NodeListOf<HTMLInputElement>;
    inputs.forEach((input) => {
      input.value = ''; // Clear input values
      input.dispatchEvent(new Event('input')); // Trigger input event to update the model
    });

    const selects = document.querySelectorAll(
      '.filtros select'
    ) as NodeListOf<HTMLSelectElement>;
    selects.forEach((select) => {
      select.value = ''; // Clear select values
      select.dispatchEvent(new Event('change')); // Trigger change event to update the model
    });

    // Recargar la tabla con todos los datos
    this.applyFilters(); // Refresh the displayed list to show all employees
  }

  filteredEmpleados: EmpListadoEmpleados[] = [];

  filtersVisible = false; // Indica si los filtros están visibles o no

  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible; // Alterna la visibilidad de los filtros
  }

  Empleados: EmpListadoEmpleados[] = [];
  employeePerformances: EmployeePerformance[] = [];
  private table: any;
  ventana: string = 'Informacion';
  router = inject(Router);
  showModal = false;
  modalContent: SafeHtml = '';
  startDate!: string;
  endDate!: string;
  nombreFiltrado: string = '';
  estadoFiltrado: string = '';
  private subscriptions: Subscription[] = [];
  private searchFilter: string = '';
  private positionFilter: string = '';
  uniquePositions: string[] = [];
  selecteduniquePositions: string[] = [];
  uniqueStates: string[] = [];

  constructor(
    private empleadoService: EmpListadoEmpleadosService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadEmpleados();
    this.initializeDates();
    //this.bindEditButtons();
  }

  getFormattedDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses de 0 a 11
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
  exportToPdf(): void {
    const doc = new jsPDF();

    if (this.ventana === 'Informacion') {
      // Extrae datos de la tabla de empleados
      const dataToExport = this.Empleados.map((empleado) => [
        empleado.active ? empleado.license ? 'Licencia' : 'Activo' : 'Inactivo',
        empleado.fullName,
        empleado.document,
        empleado.position,
        empleado.salary,
      ]);

      doc.setFontSize(16);
      doc.text('Lista de Empleados', 10, 10);
      (doc as any).autoTable({
        head: [['Estado','Apellido y Nombre', 'Documento', 'Posición', 'Salario']],
        body: dataToExport,
        startY: 30,
        theme: 'grid',
        margin: { top: 30, bottom: 20 },
      });
    }

    doc.save(`${this.getFormattedDate()}_Lista_Empleados.pdf`);
  }

  exportToExcel(): void {

    const encabezado = [
      ['Listado de Empleados'],
      [], // Fila en blanco
      ['Estado', 'Nombre', 'Documento', 'Posición', 'Salario'] 
    ];

    // Extrae los datos de los empleados en formato de arreglo de arreglos
    let dataToExport: any[] = [];

    if (this.ventana === 'Informacion') {
      dataToExport = this.Empleados.map((empleado) => [
        empleado.active ? (empleado.license ? 'Licencia' : 'Activo') : 'Inactivo',
        empleado.fullName,
        empleado.document,
        empleado.position,
        empleado.salary
      ]);
    }

    // Combina encabezado con los datos de exportación
    const worksheetData = [...encabezado, ...dataToExport];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Crea el libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Lista de ${this.ventana}`
    );

    // Descarga el archivo Excel
    XLSX.writeFile(workbook, `${this.getFormattedDate()}_Lista_Empleados.xlsx`);
}


  onSearchFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchFilter = input.value.toLowerCase();
    this.applyFilters();
  }

  private updatePositionFilter(): void {
    const comboFiltroCargo = document.getElementById(
      'comboFiltroCargo'
    ) as HTMLSelectElement;
    if (comboFiltroCargo) {
      const currentValue = comboFiltroCargo.value; // Guardar el valor actual

      // Limpiar opciones existentes excepto la primera
      while (comboFiltroCargo.options.length > 1) {
        comboFiltroCargo.remove(1);
      }

      // Agregar las nuevas opciones
      this.uniquePositions.forEach((position) => {
        if (position) {
          const option = document.createElement('option');
          option.value = position;
          option.text = position;
          comboFiltroCargo.appendChild(option);
        }
      });

      // Restaurar el valor seleccionado si existía
      if (currentValue && this.uniquePositions.includes(currentValue)) {
        comboFiltroCargo.value = currentValue;
        this.positionFilter = currentValue;
      }
    }
  }

  private updateStateFilter(): void {
    const comboFiltroEstado = document.getElementById(
      'comboFiltroEstado'
    ) as HTMLSelectElement;
    if (comboFiltroEstado) {
      const currentValue = comboFiltroEstado.value; // Guardar el valor actual

      // Limpiar opciones existentes excepto la primera
      while (comboFiltroEstado.options.length > 1) {
        comboFiltroEstado.remove(1);
      }

      // Agregar las nuevas opciones
      this.uniqueStates.forEach((state) => {
        if (state) {
          const option = document.createElement('option');
          option.value = state;
          option.text = state;
          comboFiltroEstado.appendChild(option);
        }
      });

      // Restaurar el valor seleccionado si existía
      if (currentValue && this.uniqueStates.includes(currentValue)) {
        comboFiltroEstado.value = currentValue;
        this.estadoFiltrado = currentValue;
      }
    }
  }

  selectedPositions: string[] = []; // Array para almacenar las posiciones seleccionadas

  onPositionFilterChange(): void {
    this.applyFilters();
  }

  selectedState: string[] = []; // Variable para almacenar el estado seleccionado

  onStateFilterChange(event: Event, position: string): void {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      this.selectedState.push(position);
    } else {
      this.selectedState = this.selectedState.filter((p) => p !== position);
    }

    this.applyFilters();
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    if (this.table) {
      this.table.destroy();
    }
  }

  initializeDates(): void {
    const today = new Date();
    const firstDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 0,
      1
    );
    const lastDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    this.startDate = this.formatDate(thirtyDaysAgo);
    this.endDate = this.formatDate(today);
  }

  loadEmpleados(): void {
    const empSubscription = this.empleadoService.getEmployees().subscribe({
      next: (empleados) => {
        this.Empleados = empleados;
        console.log('Empleados:', this.Empleados);
        this.ventana = 'Informacion';
        // Obtener posiciones únicas
        this.uniquePositions = [
          ...new Set(empleados.map((emp) => emp.position)),
        ].sort();
        //cargar estados unicos, en caso de que sea activo, validar si esta en licencia
        this.uniqueStates = [
          ...new Set(
            empleados.map((emp) =>
              emp.active ? (emp.license ? 'Licencia' : 'Activo') : 'Inactivo'
            )
          ),
        ].sort();

        // Guardar el filtro actual si existe
        const currentFilter = this.positionFilter;

        // Inicializar DataTable
        this.initializeDataTable();

        // Actualizar el combobox y restaurar el filtro
        setTimeout(() => {
          this.updatePositionFilter();
          if (currentFilter) {
            this.positionFilter = currentFilter;
            this.applyFilters();
          }
        });
      },
      error: (err) => console.error('Error al cargar empleados:', err),
    });
    this.subscriptions.push(empSubscription);
  }

  loadDesempeno(): void {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
  }

  initializeDataTable(): void {
    if (this.table) {
      this.table.destroy();
      $('#empleadosTable').empty();
    }

    const commonConfig = {
      pageLength: 5,
      lengthChange: true,
      searching: false,
      language: {
        search: 'Buscar:',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        lengthMenu: `<select class="form-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
        zeroRecords: 'No se encontraron registros',
        emptyTable: 'No se encontraron empleados',
      },
    };

    switch (this.ventana) {
      case 'Informacion':
        this.initializeInformacionTable(commonConfig);
        break;
    }
  }

  /// necesito que borres la linea de la tabla 

  private initializeInformacionTable(commonConfig: any): void {
    this.table = $('#empleadosTable').DataTable({
      ...commonConfig,
      layout: {
        topStart: 'search',
        topEnd: null,
      },
      dom:
        '<"mb-3"t>' + //Tabla
        '<"d-flex justify-content-between"lp>', //Paginacion
      data: this.Empleados,
      order: [[0, 'asc']], // Ordenar por fecha de forma descendente
      columns: [
        {
          data: 'active',
          title: 'Estado',
          className: 'align-middle text-center',
          render: (data: boolean, type: any, row: any) => {
            // Si el empleado está activo, valida la clave 'license' y si es true, retorna "Licencia"
            if (data) {
              return row.license
                ? '<span class="badge border rounded-pill text-bg-yellow">Licencia</span>'
                : '<span class="badge border rounded-pill text-bg-green">Activo</span>';
            }
            return '<span class="badge border rounded-pill text-bg-red">Inactivo</span>';
          },
        },
        {
          data: 'fullName',
          title: 'Apellido, Nombre',
          className: 'align-middle',
          render: (data: string, type: string, row: any) => {
            if (type === 'display') {
              return `<span class="searchable">${data}</span>`;
            }
            return data.toLowerCase();
          },
        },
        {
          data: 'document',
          title: 'Documento',
          className: 'align-middle',
          render: (data: string, type: string) => {
            if (type === 'display') {
              return `<span class="searchable">${data}</span>`;
            }
            return data;
          },
        },
        {
          data: 'position',
          title: 'Posición',
          className: 'align-middle',
          render: (data: string, type: string) => {
            if (type === 'display') {
              return data;
            }
            return data.toLowerCase();
          },
        },
        {
          data: 'salary',
          title: 'Salario',
          className: 'align-middle',
          render: (data: number | bigint) => {
            let formattedAmount = new Intl.NumberFormat('es-AR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(data);
            return `<div>$ ${formattedAmount} </div>`;
          },
        },
        {
          data: null,
          title: 'Acciones',
          className: 'text-center',
          render: (data: any) => {
            const puedeEliminar = data.active; // true si está activo o en licencia

            return `
                <div class="dropdown d-flex justify-content-center">
                <a class="btn btn-light" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"
                  style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; line-height: 1; padding: 0;">
                  &#8942;
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item consultar-btn" data-empleado-id="${
                    data.id
                  }" href="#">Ver más</a></li>
                  <li><button class="dropdown-item consultar-asistencias" data-empleado-id="${
                    data.id
                  }">Ver asistencias</button></li>
                  <li><button class="dropdown-item consultar-desempeño" data-empleado-id="${
                    data.id
                  }">Ver desempeño</button></li>

                  <li><a class="dropdown-item modificar-btn" data-empleado-id="${data.id}" href="#">Actualizar</a></li>

                  ${
                    puedeEliminar
                      ? `
                    <li class="dropdown-divider"></li>
                    <li><button class="dropdown-item eliminar-btn" data-empleado-id="${data.id}">Eliminar</button></li>
                  `
                      : ''
                  }
                </ul>
              </div>`;
          },
        },
      ],
    });

    $('#empleadosTable').on('click', '.consultar-btn', (event: any) => {
      event.preventDefault();
      const empleadoId = $(event.currentTarget).data('empleado-id');
      this.consultarEmpleado(empleadoId);
    });

    $('#empleadosTable').on('click', '.consultar-asistencias', (event: any) => {
      event.preventDefault();
      const empleadoId = $(event.currentTarget).data('empleado-id');
      console.log(empleadoId);
      this.router.navigate([`home/employee/attendance/${empleadoId}`]);
    });

    $('#empleadosTable').on('click', '.consultar-desempeño', (event: any) => {
      event.preventDefault();
      const empleadoId = $(event.currentTarget).data('empleado-id');
      this.router.navigate([`home/employee/performance/${empleadoId}`]); // Redirige al componente de desempeño con el ID del empleado
    });

    

    $('#empleadosTable').on('click', '.modificar-btn', (event: any) => {
      event.preventDefault();
      const id = $(event.currentTarget).data('empleado-id');
      this.editarEmpleado(id);
    });


  

      // Manejador de clics para los botones de eliminar
  $('#empleadosTable').on('click', '.eliminar-btn', (event: any) => {
    event.preventDefault();
    // Obtener el ID del empleado al que se hace clic
    this.empleadoIdToDelete = $(event.currentTarget).data('empleado-id');
    // Mostrar el modal
    $('#deleteModal').modal('show');
  });

    // Event handler para el botón de eliminar
/*     $('#empleadosTable').on('click', '.eliminar-btn', (event: any) => {
      event.preventDefault();
      this.empleadoIdToDelete = $(event.currentTarget).data('empleado-id');
      this.confirmDelete(); // Llama a confirmDelete al hacer clic
    }); */

    // Aplicar filtros iniciales si existen
    if (this.searchFilter || this.positionFilter) {
      this.applyFilters();
    }
  }

  // Agrega esta propiedad a la clase
  empleadoIdToDelete: number | null = null;

  //swal para confirmar eliminacion


  confirmDelete(): void {
    if (this.empleadoIdToDelete !== null) {
      // Procedemos directamente a la eliminación sin preguntar confirmación
      this.empleadoService
        .changeEmployeeStatus(this.empleadoIdToDelete)
        .subscribe({
          next: () => {
            this.loadEmpleados(); // Recargar la lista de empleados
            this.empleadoIdToDelete = null; // Limpiar el ID después de eliminar
            // Mostrar el mensaje de éxito
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El empleado ha sido eliminado correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar'  // Solo un botón de "Aceptar" en caso de eliminación exitosa
            }
            );
          },
          error: (error) => {
            console.error('Error al eliminar el empleado:', error);
            // Mostrar el mensaje de error
            Swal.fire(
              {
                title: 'Error',
                text: 'Ocurrió un error al eliminar el empleado.',
                icon: 'error',
                confirmButtonText: 'Aceptar' , // Solo un botón de "Aceptar" en caso de error
                confirmButtonColor: '#3085d6'
              }
            );
            this.empleadoIdToDelete = null;
          },
        });
    } else {
      // Si no hay un empleado seleccionado para eliminar
      Swal.fire(
        'ID no válido',
        'No se ha seleccionado un empleado para eliminar.',
        'warning'
      );
    }
  }
  

  editarEmpleado(id: any): void {
    //this.router.navigate(['employee/update/', id]);
    if (id) {
      this.router.navigate(['/home/employee/update', id]);
    }
  }


  // bindEditButtons(): void {
  //   const self = this; // Guardamos el contexto del componente
  //   $('#empleadosTable').on('click', '.edit-button', () => {
  //     const id = $(this).data('id'); // Obtenemos el ID del atributo data-id
  //     self.editarEmpleado(id); // Llama al método editarEmpleado
  //   });
  // }

  consultarEmpleado(id: number): void {
    const empByIdSubscription = this.empleadoService
      .getEmployeeById(id)
      .subscribe({
        next: (empleado) => {
          const fechaContrato = new Date(
            empleado.contractStartTime[0],
            empleado.contractStartTime[1] - 1,
            empleado.contractStartTime[2]
          ).toLocaleDateString();

          const horaInicio = `${empleado.startTime[0]}:${empleado.startTime[1]
            .toString()
            .padStart(2, '0')}`;
          const horaFin = `${empleado.endTime[0]}:${empleado.endTime[1]
            .toString()
            .padStart(2, '0')}`;

          const content = `
          <div class="container">
            <div class="row mb-3">
              <div class="col-md-6">
                <h6><strong>Información Personal</strong></h6>
                <p><strong>Nombre completo:</strong> ${empleado.surname}, ${
            empleado.name
          }</p>
                <p><strong>Documento:</strong> ${empleado.documentType} ${
            empleado.documentValue
          }</p>
                <p><strong>CUIL:</strong> ${empleado.cuil}</p>
              </div>
              <div class="col-md-6">
                <h6><strong>Información Laboral</strong></h6>
                <p><strong>Cargo:</strong> ${empleado.charge.charge}</p>
                <p><strong>Fecha de contrato:</strong> ${fechaContrato}</p>
                <p><strong>Salario:</strong> $${empleado.salary.toLocaleString()}</p>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <h6>Horario</h6>
                <p><strong>Hora entrada:</strong> ${horaInicio}</p>
                <p><strong>Hora salida:</strong> ${horaFin}</p>
              </div>
              <div class="col-md-6">
                <h6>Días laborables</h6>
                <p>
                  ${empleado.mondayWorkday ? '✓ Lunes<br>' : ''}
                  ${empleado.tuesdayWorkday ? '✓ Martes<br>' : ''}
                  ${empleado.wednesdayWorkday ? '✓ Miércoles<br>' : ''}
                  ${empleado.thursdayWorkday ? '✓ Jueves<br>' : ''}
                  ${empleado.fridayWorkday ? '✓ Viernes<br>' : ''}
                  ${empleado.saturdayWorkday ? '✓ Sábado<br>' : ''}
                  ${empleado.sundayWorkday ? '✓ Domingo' : ''}
                </p>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <h6><strong>Información adicional</strong></h6>
                <!-- <p><strong>Obra Social:</strong> ${
                  empleado.healthInsurance ? 'Sí' : 'No'
                }</p> -->
                <p><strong>Estado:</strong> ${
                  empleado.active ? 'Activo' : 'Inactivo'
                }</p>
                <p><strong>Licencia:</strong> ${
                  empleado.license ? 'Sí' : 'No'
                }</p>
              </div>
            </div>
          </div>
        `;

          this.modalContent = this.sanitizer.bypassSecurityTrustHtml(content);
          this.showModal = true;
        },
        error: (error) => {
          console.error('Error al obtener los datos del empleado:', error);
        },
      });
    this.subscriptions.push(empByIdSubscription);
  }

  onFilterByDate(): void {
    if (this.ventana === 'Desempeño') {
      this.loadDesempeno();
    }
  }

  limpiarFiltro() {
    this.nombreFiltrado = '';
    this.estadoFiltrado = '';
  }

  formatDateyyyyMMdd(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  closeModal(): void {
    this.showModal = false;
  }

  irMenu(): void {
    this.router.navigate(['']);
  }

  navigateToWakeUpCallForm(): void {
    this.router.navigate(['/wake-up-call']);
  }
}

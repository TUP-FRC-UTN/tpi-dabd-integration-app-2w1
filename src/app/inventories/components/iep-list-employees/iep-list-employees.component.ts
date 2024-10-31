import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service';
import { ListadoDesempeñoService } from '../../services/listado-desempeño.service';
import { EmpListadoEmpleados } from '../../models/emp-listado-empleados';
import { EmpListadoAsistencias } from '../../models/emp-listado-asistencias';
import { EmployeePerformance } from '../../models/listado-desempeño';

declare var $: any;
declare var DataTable: any;

@Component({
  selector: 'app-iep-list-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './iep-list-employees.component.html',
  styleUrls: ['./iep-list-employees.component.css'],
})
export class IepListEmployeesComponent implements OnInit, OnDestroy {
  Empleados: EmpListadoEmpleados[] = [];
  Asistencias: EmpListadoAsistencias[] = [];
  filteredAsistencias: EmpListadoAsistencias[] = [];
  employeePerformances: EmployeePerformance[] = [];
  private table: any;
  ventana: string = "Informacion";
  router = inject(Router);
  showModal = false;
  modalContent: SafeHtml = '';
  startDate!: string;
  endDate!: string;
  nombreFiltrado!: string;
  estadoFiltrado!: string;
  private subscriptions: Subscription[] = [];
  private searchFilter: string = '';
  private positionFilter: string = '';
  private uniquePositions: string[] = [];


  constructor(
    private empleadoService: EmpListadoEmpleadosService,
    private employeePerformanceService: ListadoDesempeñoService,
    private sanitizer: DomSanitizer

  ) { }



  ngOnInit(): void {
    this.loadEmpleados();
    this.initializeDates();
    this.setInitialDates();
    this.bindEditButtons();
  }

  exportToPdf(): void {
  }

  exportToExcel(): void {
  }




  onSearchFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchFilter = input.value.toLowerCase();
    this.applyFilters();
  }

  private updatePositionFilter(): void {
    const comboFiltroCargo = document.getElementById('comboFiltroCargo') as HTMLSelectElement;
    if (comboFiltroCargo) {
      const currentValue = comboFiltroCargo.value; // Guardar el valor actual
      
      // Limpiar opciones existentes excepto la primera
      while (comboFiltroCargo.options.length > 1) {
        comboFiltroCargo.remove(1);
      }
      
      // Agregar las nuevas opciones
      this.uniquePositions.forEach(position => {
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

  onPositionFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.positionFilter = select.value;
    this.applyFilters();
  }

  private applyFilters(): void {
    if (this.table) {
      this.table.clear();

      const filteredData = this.Empleados.filter(empleado => {
        if (!this.searchFilter && !this.positionFilter) {
          return true;
        }

        const searchTerms = this.searchFilter.toLowerCase().split(' ');
        const searchMatch = !this.searchFilter || searchTerms.every(term => {
          const fullName = empleado.fullName.toLowerCase();
          const document = empleado.document.toString().toLowerCase();
          const salary = empleado.salary.toString();
          
          return fullName.includes(term) || 
                 document.includes(term) || 
                 salary.includes(term);
        });

        const positionMatch = !this.positionFilter || 
          empleado.position === this.positionFilter;

        return searchMatch && positionMatch;
      });

      this.table.rows.add(filteredData).draw();
    }
  }

  setInitialDates(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDateInput: HTMLInputElement = document.getElementById(
      'startDate'
    ) as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById(
      'endDate'
    ) as HTMLInputElement;

    startDateInput.value = this.formatDateForInput(thirtyDaysAgo);
    endDateInput.value = this.formatDateForInput(today);

    // Establecer los límites de las fechas
    endDateInput.max = this.formatDateForInput(today);
    startDateInput.max = endDateInput.value;
    endDateInput.min = startDateInput.value;

    // Trigger the filter
    this.filterByDate();
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    if (this.table) {
      this.table.destroy();
    }
  }

  initializeDates(): void {
    const today = new Date();
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 0, 1);
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    this.startDate = this.formatDate(thirtyDaysAgo);
    this.endDate = this.formatDate(today);
  }

  loadEmpleados(): void {
    const empSubscription = this.empleadoService.getEmployees().subscribe({
      next: (empleados) => {
        this.Empleados = empleados;
        this.ventana = 'Informacion';
        // Obtener posiciones únicas
        this.uniquePositions = [...new Set(empleados.map(emp => emp.position))].sort();
        
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

  loadAsistencias(): void {
    const asistSubscription = this.empleadoService.getAttendances().subscribe({
      next: (asistencias) => {
        this.Asistencias = asistencias;
        this.filteredAsistencias = asistencias;
        this.ventana = 'Asistencias';
        // Limpiar los filtros cuando cambies a Asistencias
        this.positionFilter = '';
        this.searchFilter = '';
        this.initializeDataTable();
      },
      error: (err) => console.error('Error al cargar asistencias:', err),
    });
    this.subscriptions.push(asistSubscription);
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
      pageLength: 10,
      lengthChange: true,
      searching: false,
      language: {
        search: "Buscar:",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        lengthMenu:
          `<select class="form-select">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
        zeroRecords: "No se encontraron registros",
        emptyTable: "No hay datos disponibles",
      }
    };

    switch (this.ventana) {
      case 'Informacion':
        this.initializeInformacionTable(commonConfig);
        break;
      case 'Asistencias':
        this.initializeAsistenciasTable(commonConfig);
        break;
      case 'Desempeño':
        this.initializeDesempenoTable(commonConfig);
        break;
    }
  }

  private initializeInformacionTable(commonConfig: any): void {
    this.table = $('#empleadosTable').DataTable({
      ...commonConfig,
      layout: {
        topStart: 'search',
        topEnd: null
      },
      dom:
      '<"mb-3"t>' +                           //Tabla
      '<"d-flex justify-content-between"lp>', //Paginacion
      data: this.Empleados,
      columns: [
        {
          data: 'fullName',
          title: 'Apellido y Nombre',
          render: (data: string, type: string, row: any) => {
            if (type === 'display') {
              return `<span class="searchable">${data}</span>`;
            }
            return data.toLowerCase();
          }
        },
        { 
          data: 'document', 
          title: 'Documento',
          render: (data: string, type: string) => {
            if (type === 'display') {
              return `<span class="searchable">${data}</span>`;
            }
            return data;
          }
        },
        {
          data: 'position',
          title: 'Posición',
          render: (data: string, type: string) => {
            if (type === 'display') {
              return data;
            }
            return data.toLowerCase();
          }
        },
        {
          data: 'salary',
          title: 'Salario',
          className: 'text-end searchable',
          render: (data: number, type: string) => {
            if (type === 'display') {
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(data);
            }
            return data;
          }
        },
        {
          data: null,
          title: 'Acciones',
          render: (data: any) => {
            return `
              <div class="dropdown text-center">
                <a class="btn btn-light" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"
                  style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; line-height: 1; padding: 0;">
                  &#8942; <!-- Tres puntos verticales -->
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item consultar-btn" data-empleado-id="${data.id}" href="#">Ver más</a></li>
               
                <li><a class="dropdown-item eliminar-btn" data-bs-toggle="modal" data-bs-target="#deleteModal" data-empleado-id="${data.id}" href="#">Eliminar</a></li>
                </ul>
              </div>`;
          }
        }
      ]
    });


    $('#empleadosTable').on('click', '.consultar-btn', (event: any) => {
      event.preventDefault();
      const empleadoId = $(event.currentTarget).data('empleado-id');
      this.consultarEmpleado(empleadoId);
    });


    $('#empleadosTable').on('click', '.modificar-btn', (event: any) => {
      event.preventDefault();
      const id = $(event.currentTarget).data('empleado-id');
      this.editarEmpleado(id);
    });

    // Event handler for eliminar (delete) button
    $('#empleadosTable').on('click', '.eliminar-btn', (event: any) => {
      event.preventDefault();
      this.empleadoIdToDelete = $(event.currentTarget).data('empleado-id');
    });

    // Aplicar filtros iniciales si existen
    if (this.searchFilter || this.positionFilter) {
      this.applyFilters();
    }
  }
  // Agrega esta propiedad a la clase
  empleadoIdToDelete: number | null = null;

  // Agrega esta nueva función para manejar la confirmación
  confirmDelete(): void {
    if (this.empleadoIdToDelete) {
      this.empleadoService.changeEmployeeStatus(this.empleadoIdToDelete).subscribe({
        next: () => {
          this.loadEmpleados();
          this.empleadoIdToDelete = null;
        },
        error: (error) => {
          console.error('Error al eliminar el empleado:', error);
          alert('Error al eliminar el empleado');
          this.empleadoIdToDelete = null;
        }
      });

    }
  }


  editarEmpleado(id: any): void {

    console.log("me fuiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
    this.router.navigate(['/empleados/modificar', id]);
  }

  bindEditButtons(): void {
    const self = this; // Guardamos el contexto del componente
    $('#empleadosTable').on('click', '.edit-button', () => {
      const id = $(this).data('id'); // Obtenemos el ID del atributo data-id
      self.editarEmpleado(id); // Llama al método editarEmpleado
    });
  }




  private initializeAsistenciasTable(commonConfig: any): void {
    this.table = $('#empleadosTable').DataTable({
      ...commonConfig,
      dom:
        '<"mb-3"t>' +                           //Tabla
        '<"d-flex justify-content-between"lp>', //Paginacion
      order: [[0, 'desc']], // Ordenar por fecha de forma descendente
      data: this.filteredAsistencias,
      columns: [
        { data: 'date', title: 'Fecha' },
        { data: 'employeeName', title: 'Apellido y nombre' },
        { data: 'state', title: 'Estado', className: 'text-center',
          render: (data: any) =>{
            let color;
            
            switch (data){
              case "PRESENTE": color= "#28a745"; break;
              case "AUSENTE": color= "#dc3545"; break;
              case "JUSTIFICADO": color= "#6f42c1"; break;
              case "TARDE": color= "#ffc107"; break;     
            }
            return `<button class="btn border rounded-pill w-75" 
            style="background-color: ${color}; color: white;">${data}</button>`;
          }
        },
        { data: 'arrivalTime', title: 'Hora de entrada',
          render: (data: any, type: any, row: any, meta: any) => {
            return row.arrivalTime === null ? "--:--:--" : `${row.arrivalTime}`
          }
        },
        { data: 'departureTime', title: 'Hora de salida',
          render: (data: any, type: any, row: any, meta: any) => {
            return row.departureTime === null ? "--:--:--" : `${row.departureTime}`
          } 
        },
        { data: null,
          title: 'Seleccionar',
          className: 'text-center',
          render: (data: any, type: any, row: any, meta: any) => {
            const isHidden = row.state === "PRESENTE" || row.state === "TARDE"  ? 'style="display: none;"' : '';
            const accion = row.state === "AUSENTE" ? "Justificar" : "Injustificar";
            const nuevoEstado = row.state === "AUSENTE" ? "JUSTIFICADO" : "AUSENTE";
            const checkbox = `<button class="btn border w-75" 
            ${isHidden} data-id="${row.id}" data-nuevoestado="${nuevoEstado}">${accion}</button>`;
            
            const indicator = row.state === "PRESENTE" || row.state === "TARDE" ? '' : checkbox;
        
            return indicator;
          },
        }
      ],
    });

    $('#empleadosTable').off('click', 'button').on('click', 'button', (event: any) => {
      const button = $(event.currentTarget);
      const id = button.data('id');
      const nuevoEstado = button.data('nuevoestado');
  
      // Deshabilitar el botón para evitar múltiples clics
      button.prop('disabled', true);
  
      if (id && nuevoEstado) {
          this.empleadoService.putAttendances(id, nuevoEstado).subscribe({
              next: (response) => {
                  console.log('Asistencia actualizada:', response);
                  this.loadAsistencias();
              },
              error: (error) => {
                  console.error('Error al actualizar asistencia:', error);
              },
              complete: () => {
                  // Habilitar el botón nuevamente si es necesario
                  button.prop('disabled', false);
              }
          });
      } else {
          // Habilitar el botón nuevamente si no hay id o nuevoEstado
          button.prop('disabled', false);
      }
    });
  }

  private initializeDesempenoTable(commonConfig: any): void {
    this.table = $('#empleadosTable').DataTable({
      layout: {
        topStart: 'search',
        topEnd: null
      },
      ...commonConfig,
      data: this.employeePerformances,
      columns: [
        {
          data: 'performance',
          title: 'Fecha Inicio',
          render: (data: any[]) => {
            return data.length > 0 ? new Date(data[0].startDate).toLocaleDateString() : 'No hay fechas';
          }
        },
        {
          data: 'performance',
          title: 'Fecha Fin',
          render: (data: any[]) => {
            return data.length > 0 ? new Date(data[0].endDate).toLocaleDateString() : 'No hay fechas';
          }
        },
        { data: 'employee.fullName', title: 'Nombre' },
        { data: 'employee.position', title: 'Cargo' },
        {
          data: 'performance',
          title: 'Desempeño',
          render: (data: any[]) => {
            return data.length > 0 ? data[0].performanceType : 'No hay datos';
          }
        },
        {
          data: 'performance',
          title: 'Observaciones',
          render: (data: any[]) => {
            const filteredData = data.filter(item => {
              const itemDate = new Date(item.startDate);
              const startDate = new Date(this.startDate);
              const endDate = new Date(this.endDate);
              return itemDate >= startDate && itemDate <= endDate;
            });
            return filteredData.length > 0 ? filteredData.length : 'No hay observaciones';
          }
        }
      ]
    });
  }

  consultarEmpleado(id: number): void {
    const empByIdSubscription = this.empleadoService.getEmployeeById(id).subscribe({
      next: (empleado) => {
        const fechaContrato = new Date(empleado.contractStartTime[0],
          empleado.contractStartTime[1] - 1,
          empleado.contractStartTime[2])
          .toLocaleDateString();

        const horaInicio = `${empleado.startTime[0]}:${empleado.startTime[1].toString().padStart(2, '0')}`;
        const horaFin = `${empleado.endTime[0]}:${empleado.endTime[1].toString().padStart(2, '0')}`;

        const content = `
          <div class="container">
            <div class="row mb-3">
              <div class="col-md-6">
                <h6>Información Personal</h6>
                <p><strong>Nombre completo:</strong> ${empleado.surname}, ${empleado.name}</p>
                <p><strong>Documento:</strong> ${empleado.documentType} ${empleado.documentValue}</p>
                <p><strong>CUIL:</strong> ${empleado.cuil}</p>
              </div>
              <div class="col-md-6">
                <h6>Información Laboral</h6>
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
                <h6>Información adicional</h6>
                <p><strong>Obra Social:</strong> ${empleado.healthInsurance ? 'Sí' : 'No'}</p>
                <p><strong>Estado:</strong> ${empleado.active ? 'Activo' : 'Inactivo'}</p>
                <p><strong>Licencia:</strong> ${empleado.license ? 'Sí' : 'No'}</p>
              </div>
            </div>
          </div>
        `;

        this.modalContent = this.sanitizer.bypassSecurityTrustHtml(content);
        this.showModal = true;
      },
      error: (error) => {
        console.error('Error al obtener los datos del empleado:', error);
      }
    });
    this.subscriptions.push(empByIdSubscription);
  }

  onStartDateChange(): void {
    const startDateInput: HTMLInputElement = document.getElementById('startDate') as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById('endDate') as HTMLInputElement;

    // Establecer límites de fechas
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    endDateInput.max = formattedToday;

    if (startDateInput.value) {
      endDateInput.min = startDateInput.value;
    } else {
      endDateInput.min = '';
    }

    this.filterByDate();
  }

  onEndDateChange(): void {
    const startDateInput: HTMLInputElement = document.getElementById('startDate') as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById('endDate') as HTMLInputElement;

    if (endDateInput.value) {
      startDateInput.max = endDateInput.value;
    } else {
      startDateInput.max = '';
    }

    this.filterByDate();
  }

  filterByDate(): void {
    const startDateInput: HTMLInputElement = document.getElementById('startDate') as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById('endDate') as HTMLInputElement;

    const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
    const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

    if (startDate && endDate && startDate > endDate) {
      //alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
      startDateInput.value = '';
      endDateInput.value = '';
      return;
    }
    this.filteredAsistencias = this.Asistencias.filter((producto) => {
      const productDate = new Date(this.formatDateyyyyMMdd(producto.date));
      return (
        (!startDate || productDate >= startDate) &&
        (!endDate || productDate <= endDate)
      );
    });

    if (this.nombreFiltrado.length >= 3) {
      this.filteredAsistencias = this.filteredAsistencias.filter((asistencia) => {
        return asistencia.employeeName.toUpperCase().includes(this.nombreFiltrado.toUpperCase());
      })
    }

    if (this.estadoFiltrado !== ""){
      this.filteredAsistencias = this.filteredAsistencias.filter((asistencia) => {
        return asistencia.state === this.estadoFiltrado;
      })
    }

    // Actualizar el DataTable
    if (this.table) {
      this.table.clear().rows.add(this.filteredAsistencias).draw(); // Actualiza la tabla con los productos filtrados
    }
  }

  onFilterByDate(): void {
    if (this.ventana === 'Desempeño') {
      this.loadDesempeno();
    }
  }

  limpiarFiltro(){
    this.nombreFiltrado = "";
    this.estadoFiltrado = "";
    this.setInitialDates();
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
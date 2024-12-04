import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EmpListadoAsistencias } from '../../Models/emp-listado-asistencias';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { NgLabelTemplateDirective, NgSelectModule } from '@ng-select/ng-select';
import { IepAttendancesNgselectComponent } from "../iep-attendances-ngselect/iep-attendances-ngselect.component";
import { EmpPostConfigurationResponse } from '../../Models/emp-post-configuration';
import { PillowTimeLateArrivalService } from '../../services/pillow-time-late-arrival.service';
import { AuthService } from '../../../../users/users-servicies/auth.service';
import $ from 'jquery';
import 'datatables.net'; // Importación de DataTables
import 'datatables.net-dt'; // Estilos para DataTables
import 'datatables.net-bs5';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

@Component({
  selector: 'app-iep-attendances',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, NgLabelTemplateDirective, JsonPipe, IepAttendancesNgselectComponent],
  templateUrl: './iep-attendances.component.html',
  styleUrl: './iep-attendances.component.css'
})
export class IepAttendancesComponent implements OnInit, OnDestroy{
  
  Asistencias: EmpListadoAsistencias[] = [];
  filteredAsistencias: EmpListadoAsistencias[] = [];
  private table: any;
  router = inject(Router);
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  empleadoId: number = 0;
  empleadoName: string = "";
  startDate!: string;
  endDate!: string;
  estadosFiltrados: any[] = [];
  fechaMaxima: string='';

  id: number = 0;
  nuevoEstado: string = "";
  justificationPutText: string = "";
  justificationGetText: string = "";
  actualConfig:EmpPostConfigurationResponse={
    pillowLastArrival: 0,
    pillowJustify: 0,
    userId: 0
  };

  constructor(
    private empleadoService: EmpListadoEmpleadosService,
    private route: ActivatedRoute,
    private pillowTimeLateArrivalService: PillowTimeLateArrivalService,
    private mockid: AuthService 
    , private tutorialService: TutorialService
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
      keyboardNavigation: false,
      useModalOverlay: true,
    }); 

    const hoy = new Date();
    this.fechaMaxima = hoy.toISOString().split('T')[0];
  }
  ngOnDestroy(): void {
    this.tutorialSubscription.unsubscribe();
    if (this.tour) {
      this.tour.complete();
    }

    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }
  
  ngOnInit(): void {
    const name = Number(this.route.snapshot.paramMap.get('id'));  // Esto devuelve un string
    if (name) { this.empleadoId = name;}  // Guardamos el string
    this.pillowTimeLateArrivalService.actualConfig().subscribe(data=>{
      this.actualConfig=data;
      console.log("Data"+data);
    })
    this.loadAsistencias();
    this.initializeDates();
    this.setInitialDates();
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
    this.tour.addStep({
      id: 'table-step',
      title: 'Tabla de Asistencias',
      text: 'Acá puede ver todas las asistencias del empleado, ordenados por fecha.',
      attachTo: {
        element: '#empleadosTable',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Siguiente',
          action: this.tour.next,
        }
      ]
    });

    this.tour.addStep({
      id: 'subject-step',
      title: 'Filtros',
      text: 'Desde acá podrá filtrar los empleados por fecha y estado. También puede exportar a Excel o PDF, o borrar los filtros aplicados con el botón de basura.',      attachTo: {
        element: '#filtros',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Siguiente',
          action: this.tour.next
        }
      ]
      
    });
    this.tour.addStep({
      id: 'subject-step',
      title: 'Acciones',
      text: 'Mediante este boton podra acceder a la justificacion de una llegada tarde o falta de un empleado.',      attachTo: {
        element: '#actions',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Siguiente',
          action: this.tour.next
        }
      ]
      
    });
    //TODO OPCIONES
    this.tour.addStep({
      id: 'subject-step',
      title: 'Volver atras',
      text: 'Tocando este boton volvera a la pantalla del listado de empleados.',      attachTo: {
        element: '#arrow',
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


  
  initializeDates(): void {
    const today = new Date();
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 0, 1);
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    this.startDate = this.formatDate(thirtyDaysAgo);
    this.endDate = this.formatDate(today);
  }



  reSetInitialDates(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDateInput: HTMLInputElement = document.getElementById(
      'startDate'
    ) as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById(
      'endDate'
    ) as HTMLInputElement;

    startDateInput.value = ""
    endDateInput.value = ""

    // Establecer los límites de las fechas
    endDateInput.max = this.formatDateForInput(today);
    startDateInput.max = endDateInput.value;
    endDateInput.min = startDateInput.value;
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
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadAsistencias(): void {
    const asistSubscription = this.empleadoService.getAttendances().subscribe({
      next: (asistencias) => {
        console.log('Asistencias cargadas:', asistencias);
        this.Asistencias = asistencias;
        this.filteredAsistencias = asistencias;
        this.filtrar();
        this.initializeAsistenciasTable();
      },
      error: (err) => console.error('Error al cargar asistencias:', err),
    });
  }

  private initializeAsistenciasTable(): void {

    if (this.table) {
     this.table.destroy();
     // $('#empleadosTable').empty();
    }

    this.table = $('#empleadosTable').DataTable({ 
      pageLength: 5,
      lengthChange: true,
      searching: false,
      language: {
        search: "Buscar:",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        lengthMenu:
          `<select class="form-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
        zeroRecords: "No se encontraron registros",
        emptyTable: "No hay datos disponibles",
      },
      dom:
        '<"mb-3"t>' +                           //Tabla
        '<"d-flex justify-content-between"lp>', //Paginacion
      order: [[0, 'desc']], // Ordenar por fecha de forma descendente
      data: this.filteredAsistencias,
      columns: [
        { data: 'date', title: 'Fecha' },
        {
          data: 'state', title: 'Estado', className: "text-center",
          render: (data: any) => {
            let color;
            let name;

            switch (data) {
              case "PRESENTE": color = "text-bg-success"; name = "Presente"; break;
              case "AUSENTE": color = "text-bg-danger"; name = "Ausente"; break;
              case "JUSTIFICADO": color = "text-bg-indigo"; name = "Justificado"; break;
              case "TARDE": color = "text-bg-warning"; name = "Tarde"; break;
            }
            return `
            <div class=text-center">
              <div class="badge border rounded-pill ${color}">${name}</div>
            </div>`;
          }
        },
        {
          data: 'arrivalTime', title: 'Hora de Entrada',
          render: (data: any, type: any, row: any, meta: any) => {
            return row.arrivalTime === null ? "--:--:--" : `${row.arrivalTime}`
          }
        },
        {
          data: 'departureTime', title: 'Hora de Salida',
          render: (data: any, type: any, row: any, meta: any) => {
            return row.departureTime === null ? "--:--:--" : `${row.departureTime}`
          }
        },
        {
          data: null,
          title: 'Accion',
          className: 'align-middle',
          render: (data: any, type: any, row: any, meta: any) => {
            const isHidden = row.state === "PRESENTE" || row.state === "TARDE" ? 'style="display: none;"' : '';
  
            // Lógica para los estados AUSENTE y JUSTIFICADO
            let dropdown = '';   
            if (row.state === "AUSENTE" && this.isValidDateToJustify(row.date)) {
              dropdown = `
                <div class="text-center">
                  <div class="btn-group">
                    <div class="dropdown">
                      <button type="button" class="btn border border-2 bi-three-dots-vertical btn-cambiar-estado" id="actions" data-bs-toggle="dropdown"></button>
                        <ul class="dropdown-menu">
                          <li><button class="dropdown-item btn-cambiar-estado" data-id="${row.id}" data-nuevoestado="JUSTIFICADO"
                          data-bs-toggle="modal" data-bs-target="#modalPutJustificacion">Justificar</button></li>
                        </ul>
                    </div>
                  </div>
                </div>`;
            } else if (row.state === "JUSTIFICADO") {
              dropdown = `
                <div class="text-center">
                  <div class="btn-group">
                    <div class="dropdown">
                      <button type="button" class="btn border border-2 bi-three-dots-vertical" data-bs-toggle="dropdown"></button>
                        <ul class="dropdown-menu">
                          <li><button class="dropdown-item btn-ver"  data-justificacion="${row.justification}"
                          data-bs-toggle="modal" data-bs-target="#modalGetJustificacion"> Ver más</button></li>
                        </ul>
                    </div>
                  </div>
                </div>`;
              }

              // INJUSTIFICACION
              // <li class="dropdown-divider"></li>
              // <li><button class="dropdown-item btn-cambiar-estado" data-id="${row.id}" data-nuevoestado="AUSENTE">Injustificar</button></li>


            // Si el estado es PRESENTE o TARDE, no mostramos el dropdown
            const indicator = row.state === "PRESENTE" || row.state === "TARDE" ? '' : dropdown;

            return indicator;
          },
        }
      ],
      
    });

     $('#empleadosTable').off('click', '.btn-cambiar-estado').on('click', '.btn-cambiar-estado', (event: 
      { preventDefault: () => void; currentTarget: any; }) => {
        const button = $(event.currentTarget);
        const id = button.data('id');
        const nuevoEstado = button.data('nuevoestado');

        // Deshabilitar el botón para evitar múltiples clics
        button.prop('disabled', true);

        this.id = id;
        this.nuevoEstado = nuevoEstado;

        button.prop('disabled', false);
     });

     $('#empleadosTable').off('click', '.btn-ver').on('click', '.btn-ver', (event: 
      { preventDefault: () => void; currentTarget: any; }) => {
        const button = $(event.currentTarget);
        const justificacion = button.data('justificacion');

        // Deshabilitar el botón para evitar múltiples clics
        button.prop('disabled', true);

        this.justificationGetText = justificacion;

        button.prop('disabled', false);
     });
  }
  
  isValidDateToJustify(date:any):boolean{
    const [day, month, year] = date.split('/').map((part: string) => parseInt(part, 10));
  
    // Crea la fecha usando el formato correcto
    const inputDate = new Date(year, month - 1, day); // En JavaScript, los meses van de 0 a 11
  
    // Obtiene la fecha actual y la establece a la medianoche para comparar solo la fecha
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calcula la diferencia en milisegundos entre la fecha actual y la fecha de entrada
    const diffInMs = today.getTime() - inputDate.getTime();
    
    // Convierte la diferencia a días
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    // Devuelve true si la diferencia está dentro del rango permitido y la fecha no es futura
    const isValid = diffInDays <= this.actualConfig.pillowJustify && diffInDays >= 0;
  
    console.log(`Fecha ingresada: ${date}, Días de diferencia: ${diffInDays},rango ${this.actualConfig.pillowJustify}, Válido: ${isValid}`);
    return isValid;
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

    this.loadAsistencias();
  }

  onEndDateChange(): void {
    const startDateInput: HTMLInputElement = document.getElementById('startDate') as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById('endDate') as HTMLInputElement;

    if (endDateInput.value) {
      startDateInput.max = endDateInput.value;
    } else {
      startDateInput.max = '';
    }

    this.loadAsistencias();
  }

  filtrar(): void {

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
    
    if (this.estadosFiltrados && this.estadosFiltrados.length > 0) {
      const estadosSeleccionados = this.estadosFiltrados.map(estado => estado.value);
  
      // Filtramos solo las asistencias cuyo estado está en la lista de estados seleccionados
      this.filteredAsistencias = this.filteredAsistencias.filter(asistencia => 
        estadosSeleccionados.includes(asistencia.state)
      );
    }

    this.filteredAsistencias = this.filteredAsistencias.filter((asistencia) => {
      return asistencia.employeeId === this.empleadoId;
    })

    const asistencia = this.Asistencias.find(asistencia => asistencia.employeeId === this.empleadoId);
    if (asistencia) { this.empleadoName = asistencia.employeeName; }
  }
  
  formatDateyyyyMMdd(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }
  
  limpiarFiltro() {
    this.estadosFiltrados = [];
    this.reSetInitialDates();
    this.loadAsistencias();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  confirmarJustificacion(){
    if(this.justificationPutText){
      this.empleadoService.putAttendances(this.id, this.nuevoEstado, this.justificationPutText).subscribe({
        next: (response) => {
          console.log('Asistencia actualizada:', response);
          this.loadAsistencias();
        },
        error: (error) => {
          console.error('Error al actualizar asistencia:', error);
        }
      });
    } else { console.log("falta")}
  }

  exportToExcel(): void {
    let dataToExport: any[] = []; // Define un array vacío por defecto
      // Extrae datos de la tabla de asistencias
      dataToExport = this.filteredAsistencias.map((asistencia) => ({
        'Nombre del Empleado': asistencia.employeeName,
        'Fecha': asistencia.date,
        'Hora de Llegada': asistencia.arrivalTime,
        'Hora de Salida': asistencia.departureTime,
        'Estado': asistencia.state,
      }));
    

    // Aquí se asegura de que dataToExport nunca sea undefined
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Lista de asistencias`);

    XLSX.writeFile(workbook, `Lista_asistencias_${this.empleadoName}_${this.getFormattedDate()}.xlsx`);
  }

  exportToExcel2(): void {
    const encabezado = [
      ['Listado de Asistencias'],
      [], // Fila en blanco
      ['Nombre del Empleado', 'Fecha', 'Hora de Llegada', 'Hora de Salida', 'Estado'] 
    ];

    // Extrae datos de la tabla de asistencias
    const dataToExport = this.filteredAsistencias.map((asistencia) => [
      asistencia.employeeName,
      asistencia.date,
      asistencia.arrivalTime,
      asistencia.departureTime,
      asistencia.state,
    ]);

    // Crea una hoja de cálculo (worksheet)
    const worksheetData = [...encabezado, ...dataToExport];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Crea un libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Asistencias');

    // Descarga el archivo Excel
    XLSX.writeFile(workbook, `${this.getFormattedDate()}_Lista_Asistencias_${this.empleadoName}.xlsx`);
}


  exportToPdf(): void {
    console.log('Exportando a PDF...');
    const doc = new jsPDF();
  
    // Verifica si hay datos en Asistencias
    if (!this.Asistencias || this.Asistencias.length === 0) {
      console.error('No hay datos de asistencias');
      return;
    }
  
    // Filtra las asistencias del empleado que estás visualizando
    const filteredAsistencias = this.Asistencias.filter(
      asistencia => asistencia.employeeName === this.empleadoName
    );
  
    // Verifica si existen asistencias para el empleado seleccionado
    if (filteredAsistencias.length === 0) {
      console.error(`No hay datos de asistencia para el empleado ${this.empleadoName}`);
      return;
    }
  
    const dataToExport = filteredAsistencias.map((asistencia) => [
      asistencia.date,
      asistencia.employeeName,
      asistencia.state,
      asistencia.arrivalTime,
      asistencia.departureTime,
      asistencia.justification
    ]);
  

  
    doc.setFontSize(16);
    doc.text(`Lista de Asistencias de ${this.empleadoName}`, 10, 10);
  
    // Agrega las fechas al PDF
    doc.setFontSize(12);
  
    (doc as any).autoTable({
      head: [['Fecha', 'Apellido y nombre', 'Estado', 'Hora de entrada', 'Hora de salida', 'Observaciones']],
      body: dataToExport,
      startY: 30,
      theme: 'grid',
      margin: { top: 30, bottom: 20 }
    });
    
    doc.save(`${this.getFormattedDate()}_Lista_asistencias_${this.empleadoName}.pdf`);
  }
  
 


  getFormattedDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses de 0 a 11
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Volver al menu de empleados
  volverInventario(): void {
    this.router.navigate(["main/employees/employees"]);
  }
}
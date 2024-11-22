import { Component, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { SanctionService } from '../../../services/sanctions.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

import { PenaltiesModalFineComponent } from '../modals/penalties-get-fine-modal/penalties-get-fine-modal.component';
import { PenaltiesUpdateStateReasonModalComponent } from '../modals/penalties-update-state-reason-modal/penalties-update-state-reason-modal.component';
import { REACTIVE_NODE } from '@angular/core/primitives/signals';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Imports de DataTable con soporte para Bootstrap 5
import $ from 'jquery';
import 'datatables.net-bs5'; // DataTables con Bootstrap 5
import { RoutingService } from '../../../../common/services/routing.service';
import moment from 'moment';

import jsPDF from 'jspdf';
import { SanctionsDTO } from '../../../models/SanctionsDTO';
import autoTable from 'jspdf-autotable';
import { CustomSelectComponent } from "../../../../common/components/custom-select/custom-select.component";
import { AuthService } from '../../../../users/users-servicies/auth.service';
import { PlotService } from '../../../../users/users-servicies/plot.service';


@Component({
  selector: 'app-penalties-sanctions-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgbModule, RouterModule, CustomSelectComponent],
  templateUrl: './penalties-list-sanctions.component.html',
  styleUrl: './penalties-list-sanctions.component.scss'
})
export class PenaltiesSanctionsListComponent implements OnInit {
  //Variables
  sanctionsfilter: any[] = [];                    //
  sanctions: SanctionsDTO[] = [];                 //
  sanctionState: String = '';                     //
  selectedValue: string = '';                     //
  states: { key: string; value: string }[] = [];  //
  table: any;                                     //Tabla base
  searchTerm: string = '';                        //Valor de la barra de busqueda
  filterDateStart: string = '';
  filterDateEnd: string = '';
  selectedState: string = '';
  selectedStates: string[] = [];
  today: string = '';
  plots: any[] = [];

  options: { name: string, value: any }[] = []
  @ViewChild(CustomSelectComponent) customSelect!: CustomSelectComponent;


  //Init
  ngOnInit(): void {
    //Metodo para recargar la datatable desde dentro de un modal en el modal
    this.sanctionService.refreshTable$.subscribe(() => {
      this.refreshData();
      
    });

    this.getStates();
    this.refreshData();
    this.loadPlots();
    //Esto es para acceder al metodo desde afuera del datatable
    const that = this; // para referenciar metodos afuera de la datatable
    $('#sanctionsTable').on('click', 'a.dropdown-item', function (event) {
      const action = $(this).data('action');
      const id = $(this).data('id');
      const state = $(this).data('state');

      switch (action) {
        case 'newDisclaimer':
          that.newDisclaimer(id);
          break;
        case 'changeState':
          that.changeState(id, state);
          break;
        case 'updateFine':
          that.updateFine(id);
          break;
      }
    });
    this.resetDates()
    this.today = new Date().toISOString().split('T')[0];
  }


  //Reinicia las fechas a la actual y la de hace 30 dias
  resetDates() {
    const today = new Date();
    this.filterDateEnd = this.formatDateToString(today); // Fecha final con hora 00:00:00

    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    this.filterDateStart = this.formatDateToString(previousMonthDate); // Fecha de inicio con hora 00:00:00
  }


  // Función para convertir la fecha al formato `YYYY-MM-DD`
  private formatDateToString(date: Date): string {
    // Crear una fecha ajustada a UTC-3 y establecer la hora a 00:00:00 para evitar horas residuales
    const adjustedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    return adjustedDate.toLocaleDateString('en-CA'); // Formato estándar `YYYY-MM-DD`
  }

  loadPlots() {
    this.plotService.getAllPlots().subscribe({
      next: (data) => {
        this.plots = data;
        console.log('Lotes cargados:', data);
      },
      error: (error) => {
        console.error('error: ', error);
      }
    })
  }


  //Constructor
  constructor(
    private _modal: NgbModal,
    private sanctionService: SanctionService,
    private routingService: RoutingService,
    private authService: AuthService,
    private plotService: PlotService
  ) {
    (window as any).viewFine = (id: number) => this.viewFine(id);
  }


  ///////////////////////////////////////////////////////////////////////////////////////
  //Manejo del Datatable
  updateDataTable() {
    if ($.fn.dataTable.isDataTable('#sanctionsTable')) {
      $('#sanctionsTable').DataTable().clear().destroy();
    }
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'DD/MM/YYYY').unix()
    let table = this.table = $('#sanctionsTable').DataTable({
      // Atributos de la tabla
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      order: [0, 'desc'],
      lengthMenu: [5, 10, 25, 50],
      pageLength: 5,
      data: this.sanctionsfilter, // Fuente de datos
      // Columnas de la tabla
      columns: [
        {
          data: 'createdDate',
          className: 'align-middle',
          render: (data) => moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          type: 'date-moment'
        },
        {
          data: 'fineState',
          className: 'align-middle',
          render: (data) => {
            const displayValue = data === null ? 'Advertencia' : data;
            return `
            <div class="text-center">
              <div class="badge ${this.getStatusClass(displayValue)} border rounded-pill">${displayValue}</div>
            </div>`;
          }
        },
        {
          data: 'plotId',
          className: 'align-middle',
          render: (data) =>
            `<div>${this.getPlotData(data)}</div>`
        },
        {
          data: 'amount',
          className: 'align-middle',
          render: (data) => {
            let formattedAmount = data != null ? '$' + new Intl.NumberFormat('es-AR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(data) : '';
            return `<div class="text-end">${formattedAmount}</div>`;
          }
        },
        {
          data: 'description',
          className: 'align-middle',
          render: (data) => {
            const slicedData = (data.length > 45) ? (data.slice(0, 45) + '...') : (data);
            return `<div>${slicedData}</div>`;
          }
        },
        {
          data: null,
          searchable: false,
          className: 'align-middle',
          render: (data) => {
            if (data.amount === null) {
              return '';
            }
            return `<div class="text-center">
                      <div class="btn-group">
                        <div class="dropdown">
                          <button type="button" class="btn btn-light border border-2 bi-three-dots-vertical" data-bs-toggle="dropdown"></button>
                          <ul class="dropdown-menu">
                            <li><a class="dropdown-item" onclick="viewFine(${data.id})">Ver más</a></li>
                            ${this.getPermisionsToEdit() && (data.fineState === "Apelada" || data.fineState === "Pendiente") ? `
                              <li><hr class="dropdown-divider"></li>
                              <li><a class="dropdown-item" data-action="updateFine" data-id="${data.id}"'>Editar</a></li>` : ``}
                            ${data.fineState == "Pendiente" && (this.getPermisionsToEdit() || this.getPermissionsToDischarge())  ? 
                            `<li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" data-action="newDisclaimer" data-id="${data.id}">Descargo</a></li>` : ``}
                          </ul>
                        </div>
                      </div>
                    </div>`;
          }
        }
      ],
      dom: '<"mb-3"t>' + '<"d-flex justify-content-between"lp>', // Tabla y paginación
      language: {
        lengthMenu: `
          <select class="form-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
        zeroRecords: "No se encontraron resultados",
        loadingRecords: "Cargando...",
        processing: "Procesando..."
      },
    });
  }

  permisionToEdit : boolean = false
  getPermisionsToEdit(){
    if(this.authService.getActualRole() === 'SuperAdmin' ||  
    this.authService.getActualRole() === 'Gerente multas'){
      this.permisionToEdit = true
    }
    return this.permisionToEdit;
  }
  permisionToDischarge: boolean = false
  getPermissionsToDischarge(){
    if(this.authService.getActualRole() === 'Propietario' ||
      this.authService.getActualRole() === 'Inquilino'){
      this.permisionToDischarge = true
    }
    return this.permisionToDischarge;
  }


  //
  viewFine(i: number) {
    const modal = this._modal.open(PenaltiesModalFineComponent, {
      size: 'xl',
      keyboard: false,
    });
    modal.componentInstance.fineId = i;
    modal.result
      .then((result: any) => { })
      .catch((error: any) => {
        console.log('Modal dismissed with error:', error);
      });
  }


  //Abre el modal de vermas por id de multa
  openModal(fineId: number) {
    const modal = this._modal.open(PenaltiesModalFineComponent, {
      size: 'md',
      keyboard: false,
    });
    modal.componentInstance.fineId = fineId;
    modal.result
      .then((result: any) => {
        this.refreshData();
      })
      .catch((error: any) => {
        console.log("Error con modal: " + error);
      });
  }


  //Metodo para manejar la busqueda
  onSearch(event: any) {
    const searchValue = event.target.value;

    //Comprobacion de 3 o mas caracteres (No me gusta pero a Santoro si :c)
    if (searchValue.length >= 3) {
      this.table.search(searchValue).draw();
    } else if (searchValue.length === 0) {
      this.table.search('').draw();
    }
  }


  // Método para filtrar la tabla en base a las 2 fechas y estado
  filterData() {
    let filteredComplaints = [...this.sanctions];  // Copiar los datos de las sanciones que no han sido filtradas aún
    // Filtrar por estado si se ha seleccionado alguno
    if (this.selectedStates.length > 0) {
      if (this.selectedStates.includes('Advertencia')) {
        // Filtrar por estado 'Advertencia' y por elementos con fineState == null
        filteredComplaints = filteredComplaints.filter(
          (c) => c.fineState === null || this.selectedStates.includes(c.fineState)
        );
      } else {
        // Filtrar por el estado seleccionado (no 'Advertencia')
        filteredComplaints = filteredComplaints.filter(
          (c) => this.selectedStates.includes(c.fineState!) //FixMe
        );
      }
    }

    // Filtrar por fecha si las fechas están definidas
    const startDate = this.filterDateStart ? new Date(this.filterDateStart + 'T00:00:00') : null;  // Ajustar la fecha de inicio a las 00:00:00
    const endDate = this.filterDateEnd ? new Date(this.filterDateEnd + 'T23:59:59') : null;  // Ajustar la fecha de fin a las 23:59:59

    filteredComplaints = filteredComplaints.filter((item) => {
      const date = new Date(item.createdDate);
      if (isNaN(date.getTime())) {
        console.warn(`Fecha no válida: ${item.createdDate}`);
        return false;
      }

      // Verifica si la fecha está entre las fechas de inicio y fin
      const afterStartDate = !startDate || date >= startDate;
      const beforeEndDate = !endDate || date <= endDate;

      return afterStartDate && beforeEndDate;
    });
    // Actualiza los datos filtrados en la tabla
    this.sanctionsfilter = filteredComplaints;
    this.updateDataTable(); // Llama a la función para actualizar la tabla
  }


  // Método para manejar la selección del estado
  onFilter(data: any) {
    this.selectedStates = data;
    this.filterData();
  }


  // Método para manejar el cambio de fechas
  filterDate() {
    this.filterData(); // Aplica los filtros de fecha y estado
  }


  //Limpia los filtros
  eraseFilters() {
    this.refreshData();
    this.selectedStates = [];
    this.searchTerm = '';
    this.resetDates();
    this.customSelect.setData(this.selectedStates);
  }


  //Retorna el formato para el class
  getStatusClass(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'text-bg-warning';
      case 'Apelada':
        return 'text-bg-indigo';
      case 'Pendiente de pago':
        return 'text-bg-primary';
      case 'Absuelta':
        return 'text-bg-danger';
      case 'Pagada':
        return 'text-bg-success';
      case 'Advertencia':
        return 'text-bg-orange';
      default:
        return '';
    }
  }


  //Actualiza todos los datos de la tabla consultando con la api
  refreshData() {
    let plotIds = this.authService.getUser().plotId;
    
    if (this.authService.getActualRole() === 'SuperAdmin' || 
    this.authService.getActualRole() === 'Gerente multas') {
      this.sanctionService.getAllSactions().subscribe((data) => {
        this.sanctions = [...data];
        this.sanctionsfilter = [...this.sanctions];
        this.updateDataTable();
        this.filterDate();
        console.log('Multas y advertencias cargadas:', data);
      });
    }

    else {
      this.sanctions = [];

      plotIds.forEach(plotId => {
        this.sanctionService.getAllSactions(plotId).subscribe((data) => {
          this.sanctions = [...this.sanctions, ...data];
          this.sanctionsfilter = [...this.sanctions];
          this.updateDataTable();
          this.filterDate();
          console.log(`Multas y advertencias cargadas para el lote ${plotId}: `, data);
        });
      });
    }
  }


  //Redirige a la pagina para dar de alta un descargo
  newDisclaimer(id: number) {
    this.routingService.redirect(`main/sanctions/post-disclaimer/${id}`, "Registrar Descargo")
  }

  getPlotData(plotId: number) {
    let plot = this.plots.find((plot) => plot.id === plotId);
    return plot ? `Nro: ${plot?.plot_number} - Manzana: ${plot?.block_number}`: "N/A";
  }


  //Abre el modal para actualizar el estado
  changeState(id: number, state: string) {
    this.openModalStateReason(id, state);
  }


  //Redirige a la pagina para actualizar/modificar la multa
  updateFine(id: number) {
    this.routingService.redirect(`main/sanctions/put-fine/${id}`, "Actualizar Multa")
  }


  //Abre el modal para actualizar el estado de la multa
  openModalStateReason(id: number, state: string) {
    const modal = this._modal.open(PenaltiesUpdateStateReasonModalComponent, {
      size: 'md',
      keyboard: false,
    });
    modal.componentInstance.id = id;
    modal.componentInstance.fineState = state;
    modal.result
      .then((result: any) => {
        if (result.stateUpdated) {
          this.refreshData();
        }
      })
      .catch((error: any) => {
        console.log("Error con modal: " + error);
      });
  }


  //Consulta de la api los estados para cargar el select del filtro
  getStates(): void {
    this.sanctionService.getStateFines().subscribe({
      next: (data) => {
        this.states = Object.keys(data).map(key => ({
          key,
          value: data[key]

        }));
        this.options = this.states.map(opt => ({
          name: opt.value,
          value: opt.value
        }))

      },
      error: (error) => {
        console.error('error: ', error);
      }
    })
  }


  //Exporta a PDF
  exportToPDF(): void {
    const doc = new jsPDF();
    const pageTitle = 'Listado de Sanciones';
    doc.setFontSize(18);
    doc.text(pageTitle, 15, 10);
    doc.setFontSize(12);

    const formattedDesde = this.sanctionService.formatDate(this.filterDateStart);
    const formattedHasta = this.sanctionService.formatDate(this.filterDateEnd);
    doc.text(`Fechas: Desde ${formattedDesde} hasta ${formattedHasta}`, 15, 20);

    const filteredData = this.sanctionsfilter.map((sanction: SanctionsDTO) => {
      return [
        this.sanctionService.formatDate(sanction.createdDate),
        sanction.fineState,
        sanction.description,
        sanction.plotId,
        sanction.amount != null
          ? '$' + new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(sanction.amount)
          : '',

      ];
    });

    autoTable(doc, {
      head: [['Fecha de Creación', 'Estado', 'Descripción', 'Lote', 'Monto a pagar']],
      body: filteredData,
      startY: 30,
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
    });

    doc.save(`${formattedDesde}-${formattedHasta}_Listado_Sanciones.pdf`);
  }


  //Exportar a Excel
  exportToExcel(): void {
    const encabezado = [
      ['Listado de Sanciones'],
      [`Fechas: Desde ${this.sanctionService.formatDate(this.filterDateStart)} hasta ${this.sanctionService.formatDate(this.filterDateEnd)}`],
      [],
      ['Fecha de Creación', 'Estado', 'Descripción', 'Lote', 'Monto a pagar']
    ];

    const excelData = this.sanctionsfilter.map((sanction: SanctionsDTO) => {
      return [
        this.sanctionService.formatDate(sanction.createdDate),
        sanction.fineState,
        sanction.description,
        sanction.plotId,
        sanction.amount != null
          ? '$' + new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(sanction.amount)
          : '',
      ];
    });

    const worksheetData = [...encabezado, ...excelData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    worksheet['!cols'] = [
      { wch: 20 }, // Fecha de Creación
      { wch: 20 }, // Estado
      { wch: 50 }, // Descripción
      { wch: 20 }, // Lote Infractor
      { wch: 20 }, // Monto a pagar
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sanciones');

    XLSX.writeFile(workbook, `${this.sanctionService.formatDate(this.filterDateStart)}-${this.sanctionService.formatDate(this.filterDateEnd)}_Listado_Sanciones.xlsx`);
  }

}

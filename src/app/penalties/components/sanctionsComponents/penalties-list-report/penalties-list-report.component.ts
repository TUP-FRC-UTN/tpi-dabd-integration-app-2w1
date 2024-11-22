import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SanctionService } from '../../../services/sanctions.service';
import { ReportDTO } from '../../../models/reportDTO';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PenaltiesModalReportComponent } from '../modals/penalties-get-report-modal/penalties-get-report-modal.component';
import * as XLSX from 'xlsx';
// Imports de DataTable con soporte para Bootstrap 5
import $ from 'jquery';
import 'datatables.net-bs5'; // DataTables con Bootstrap 5
// import 'datatables.net-buttons-bs5'; // Botones con estilos de Bootstrap 5
// import 'datatables.net-buttons/js/buttons.html5';
// import 'datatables.net-buttons/js/buttons.print';
import { RoutingService } from '../../../../common/services/routing.service';
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import { PenaltiesUpdateStateReasonModalComponent } from '../modals/penalties-update-state-reason-modal/penalties-update-state-reason-modal.component';
import { PenaltiesUpdateStateReasonReportModalComponent } from '../modals/penalties-update-state-reason-report-modal/penalties-update-state-reason-report-modal.component';
import { PlotService } from '../../../../users/users-servicies/plot.service';



@Component({
  selector: 'app-penalties-sanctions-report-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgbModule, CustomSelectComponent],
  templateUrl: './penalties-list-report.component.html',
  styleUrl: './penalties-list-report.component.scss'
})
export class PenaltiesSanctionsReportListComponent implements OnInit {
  //Variables
  report: ReportDTO[] = [];                       //
  reportfilter: ReportDTO[] = [];                 //
  states: { key: string; value: string }[] = [];  //
  table: any;                                     //Tabla base
  searchTerm: string = '';                        //Valor de la barra de busqueda
  filterDateStart: string = '';
  filterDateEnd: string = '';

  selectedState: string = '';
  selectedStates: string[] = [];   //Valor select
  today: string = '';
  plots: any[] = [];

  options: { value: string, name: string }[] = []
  @ViewChild(CustomSelectComponent) customSelect!: CustomSelectComponent;



  //Constructor
  constructor(
    private reportServices: SanctionService,
    private _modal: NgbModal,
    private router: Router,
    private routingService: RoutingService,
    private plotService: PlotService

  ) {
    (window as any).viewReport = (id: number) => this.viewReport(id);
    (window as any).editReport = (id: number) => this.editReport(id);

  }


  //Init
  ngOnInit(): void {
    this.loadPlots();
    this.getTypes();
    this.reportServices.refreshTable$.subscribe(() => {
      this.refreshData();
    });
    this.refreshData();

    const that = this; // para referenciar metodos afuera de la datatable

    // Sets up event listeners for the DataTable.
    $('#reportsTable').on('click', 'a.dropdown-item', function (event) {
      const action = $(this).data('action');
      const id = $(this).data('id');
      const state = $(this).data('state');

      switch (action) {
        case 'newSaction':
          that.newSanction(id);
          break;
        case 'changeState':
          that.changeState(id, state);
          break;
      }
    })
    this.resetDates()
    this.today = new Date().toISOString().split('T')[0];
  }


  resetDates() {
    const today = new Date();
    this.filterDateEnd = this.formatDateToString(today); // Fecha final con hora 00:00:00

    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    this.filterDateStart = this.formatDateToString(previousMonthDate); // Fecha de inicio con hora 00:00:00
  }


  loadPlots() {
    this.plotService.getAllPlots().subscribe({
      next: (data) => {
        this.plots = data;
        console.log('Lotes cargados:', data);
        this.refreshData(); // Call refreshData after plots are loaded
      },
      error: (error) => {
        console.error('error: ', error);
      }
    })
  }

  getPlotData(plotId: number) {
    let plot = this.plots.find((plot) => plot.id === plotId);
    return plot ? `Nro: ${plot?.plot_number} - Manzana: ${plot?.block_number}`: "N/A";
  }


  // Función para convertir la fecha al formato `YYYY-MM-DD`
  private formatDateToString(date: Date): string {
    // Crear una fecha ajustada a UTC-3 y establecer la hora a 00:00:00 para evitar horas residuales
    const adjustedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    return adjustedDate.toLocaleDateString('en-CA'); // Formato estándar `YYYY-MM-DD`
  }




  // Configures the DataTable display properties and loads data.
  updateDataTable() {
    // Clears existing DataTable if it is already initialized.
    if ($.fn.dataTable.isDataTable('#reportsTable')) {
      $('#reportsTable').DataTable().clear().destroy();
    }
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'DD/MM/YYYY').unix()
    // Initializes DataTable with specific settings.
    let table = this.table = $('#reportsTable').DataTable({
      // DataTable settings
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      order: [0, 'desc'],
      lengthMenu: [5, 10, 25, 50],
      pageLength: 5,
      data: this.reportfilter, // Fuente de datos
      // Columnas de la tabla

      columns: [
        {
          data: 'createdDate',
          className: 'align-middle',
          render: (data) => moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          type: 'date-moment'
        },
        {
          data: 'reportState',
          className: 'align-middle',
          render: (data) => `
            <div class="text-center">
              <div class="badge ${this.getStatusClass(data)} border rounded-pill">${data}</div>
            </div>`
        },
        {
          data: 'plotId',
          className: 'align-middle',
          render: (data) => {
            return `<div>${this.getPlotData(data)}</div>`
          }
        },
        {
          data: 'description',
          className: 'align-middle',
          render: (data) =>
            `<div>${data}</div>`
        },
        {
          data: null,
          className: 'align-middle',
          searchable: false, // This is to avoid searching in this column.
          render: (data) =>
            `<div class="text-center">
              <div class="btn-group">
                <div class="dropdown">
                  <button type="button" class="btn border border-2 bi-three-dots-vertical" data-bs-toggle="dropdown"></button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" onclick="viewReport(${data.id})">Ver más</a></li>
                    ${data.reportState === 'Abierto' ?
              `<li><hr class="dropdown-divider"></li> <li><a class="dropdown-item" onclick="editReport(${data.id})">Editar</a></li>` : ''}
                      ${data.reportState === 'Abierto' ?
              `<li><a class="dropdown-item" data-action="newSaction" data-id="${data.id}"">Sancionar</a></li>` : ''}
                        ${data.reportState === 'Abierto' || data.reportState === 'Pendiente' ?
              `<li><a class="dropdown-item" data-action="changeState" data-id="${data.id}" data-state="REJECTED"">Rechazar</a></li>` : ''}
                          ${data.reportState === 'Abierto' ?
              `<li><a class="dropdown-item" data-action="changeState" data-id="${data.id}" data-state="CLOSED"">Cerrar</a></li>` : ''}
                 </ul>
                </div>
              </div>
            </div>`
        }
      ],
      dom:
        '<"mb-3"t>' +                           // Table
        '<"d-flex justify-content-between"lp>', // Pagination
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
        processing: "Procesando...",
      }
    });

  }


  //
  onSearch(event: any) {
    const searchValue = event.target.value;

    if (searchValue.length >= 3) {
      this.table.search(searchValue).draw();
    } else if (searchValue.length === 0) {
      this.table.search('').draw();
    }
  }


  //
  filterData() {
    let filteredComplaints = [...this.report];  // Copiar los datos que no han sido filtrados aún.

    // Filtrar por estado, si está definido
    if (this.selectedStates.length > 0) {
      filteredComplaints = filteredComplaints.filter(
        (c) => this.selectedStates.includes(c.reportState)
      );
    }

    // Convertir las fechas de inicio y fin
    const startDate = this.filterDateStart ? new Date(this.filterDateStart + 'T00:00:00') : null;
    let endDate = this.filterDateEnd ? new Date(this.filterDateEnd + 'T23:59:59') : null; // Asegurar que se incluya todo el último día
    filteredComplaints = filteredComplaints.filter((item) => {
      const date = new Date(item.createdDate);
      if (isNaN(date.getTime())) {
        console.warn(`Fecha no válida: ${item.createdDate}`);
        return false;
      }

      // Verificar si la fecha está entre la fecha de inicio y fin
      const afterStartDate = !startDate || date >= startDate;
      const beforeEndDate = !endDate || date <= endDate;

      return afterStartDate && beforeEndDate;
    });

    // Actualizar los datos de la tabla
    this.reportfilter = filteredComplaints;
    this.updateDataTable(); // Llamar a la función para actualizar la tabla.
  }


  //
  onFilter(data: any) {
    this.selectedStates = data;
    this.filterData();
  }


  //
  filterDate() {
    this.filterData();
  }


  //
  eraseFilters() {
    this.refreshData();
    this.selectedStates = [];
    this.searchTerm = '';
    this.resetDates();
    this.customSelect.setData(this.selectedStates);
  }


  //
  refreshData() {
    this.reportServices.getAllReports().subscribe(
      response => {
        this.report = response;
        this.reportfilter = this.report;
        this.updateDataTable();
        this.filterDate();
      }, error => {
        alert(error);
      }
    );
  }


  //Redirige a el alta de una infraccion (Multa/Advert)
  newSanction(id: number) {
    this.routingService.redirect(`main/sanctions/post-fine/${id}`, "Registrar Multa")
  }

  
  //Redirige a el alta de un informe
  postRedirect() {
    this.routingService.redirect("main/sanctions/post-report", "Registrar Informe")
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  //Metodo para cambiar de pagina al update
  editReport(id: number) {
    const selectedReport = this.report.find(report => report.id === id);

    //REVISAR ROUTING
    if (selectedReport) {
      this.router.navigate(['/main/sanctions/put-report'], {
        queryParams: {
          id: selectedReport.id,
          createdDate: selectedReport.createdDate,
          reportState: selectedReport.reportState,
          plotId: selectedReport.plotId,
          description: selectedReport.description
        }
      });
    }
  }

  showReport(id: number) {
    const selectedReport = this.report.find(report => report.id === id);

    if (selectedReport) {
      this.router.navigate(['/home/sanctions/postFine'], {
        queryParams: {
          id: selectedReport.id,
          reportState: selectedReport.reportState,
          plotId: selectedReport.plotId,
          description: selectedReport.description,
          createdDate: selectedReport.createdDate,
          baseAmount: selectedReport.baseAmount
        }
      });
    }
  }


  viewReport(i: number) {
    const modal = this._modal.open(PenaltiesModalReportComponent, {
      size: 'xl',
      keyboard: false,
    });
    modal.componentInstance.id = i;
    modal.result
      .then((result) => { })
      .catch((error) => {
        console.log('Modal dismissed with error:', error);
      });
  }


  getTypes(): void {
    this.reportServices.getState().subscribe({
      next: (data) => {
        this.states = Object.keys(data).map(key => ({
          key,
          value: data[key]

        }));
        this.options = this.states.map(opt => ({
          value: opt.value,
          name: opt.value
        }))
      },
      error: (error) => {
        console.error('error: ', error);
      }
    })
  }


  getStatusClass(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'text-bg-warning';
      case 'Abierto':
        return 'text-bg-success';
      case 'Cerrado':
        return 'text-bg-secondary';
      case 'Rechazado':
        return 'text-bg-danger';
      case 'Finalizado':
        return 'text-bg-primary';
      default:
        return '';
    }
  }

  ////////////////////////////////////////////////
  //Exportar a PDF
  exportToPDF(): void {
    const doc = new jsPDF();
    const pageTitle = 'Listado de Informes';
    doc.setFontSize(18);
    doc.text(pageTitle, 15, 10);
    doc.setFontSize(12);

    const formattedDesde = this.reportServices.formatDate(this.filterDateStart);
    const formattedHasta = this.reportServices.formatDate(this.filterDateEnd);
    doc.text(`Fechas: Desde ${formattedDesde} hasta ${formattedHasta}`, 15, 20);

    const filteredData = this.reportfilter.map((report: ReportDTO) => {
      return [
        this.reportServices.formatDate(report.createdDate),
        report.reportState,
        report.description,
        report.plotId,
      ];
    });

    autoTable(doc, {
      head: [['Fecha de Creación', 'Estado', 'Descripción', 'Lote']],
      body: filteredData,
      startY: 30,
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
    });

    doc.save(`${formattedDesde}-${formattedHasta}_Listado_Informes.pdf`);
  }

  //Exportar a Excel
  exportToExcel(): void {
    const encabezado = [
      ['Listado de Informes'],
      [`Fechas: Desde ${this.reportServices.formatDate(this.filterDateStart)} hasta ${this.reportServices.formatDate(this.filterDateEnd)}`],
      [],
      ['Fecha de Creación', 'Estado', 'Descripción', 'Lote']
    ];

    const excelData = this.reportfilter.map((report: ReportDTO) => {
      return [
        this.reportServices.formatDate(report.createdDate),
        report.reportState,
        report.description,
        report.plotId,
      ];
    });

    const worksheetData = [...encabezado, ...excelData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    worksheet['!cols'] = [
      { wch: 20 }, // Fecha de Creación
      { wch: 20 }, // Estado
      { wch: 50 }, // Descripción
      { wch: 20 }, // Lote Infractor
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Informes');

    XLSX.writeFile(workbook, `${this.reportServices.formatDate(this.filterDateStart)}-${this.reportServices.formatDate(this.filterDateEnd)}_Listado_Informes.xlsx`);
  }

  //Abre el modal para actualizar el estado
  changeState(id: number, state: string) {
    this.openModalStateReason(id, state);
  }


  //Abre el modal para actualizar el estado de la multa
  openModalStateReason(id: number, state: string) {
    const modal = this._modal.open(PenaltiesUpdateStateReasonReportModalComponent, {
      size: 'md',
      keyboard: false,
    });
    modal.componentInstance.id = id;
    modal.componentInstance.reportState = state;
    modal.result
      .then((result: any) => {
        this.refreshData();
      })
      .catch((error: any) => {
        console.log("Error con modal: " + error);
      });
  }



}

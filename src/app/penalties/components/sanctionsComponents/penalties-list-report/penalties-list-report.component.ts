import { Component, OnInit } from '@angular/core';
import { PenaltiesSanctionsServicesService } from '../../../services/sanctionsService/sanctions.service';
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
import 'datatables.net-buttons-bs5'; // Botones con estilos de Bootstrap 5
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import { RoutingService } from '../../../../common/services/routing.service';
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



@Component({
  selector: 'app-penalties-sanctions-report-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgbModule],
  templateUrl: './penalties-list-report.component.html',
  styleUrl: './penalties-list-report.component.scss'
})
export class PenaltiesSanctionsReportListComponent implements OnInit {
  //Variables
  report: ReportDTO[] = [];                       //
  reportfilter: ReportDTO[] = [];                 //
  // filterDateStart: Date = new Date();             //
  // filterDateEnd: Date = new Date();               //
  states: { key: string; value: string }[] = [];  //
  table: any;                                     //Tabla base
  searchTerm: string = '';                        //Valor de la barra de busqueda
  filterDateStart: string='';
  filterDateEnd: string ='';
  
  selectedState: string = '';

  //Constructor
  constructor(
    private reportServices: PenaltiesSanctionsServicesService,
     private _modal: NgbModal, 
     private router: Router,
     private routingService: RoutingService

    ) {
    (window as any).viewReport = (id: number) => this.viewReport(id);
    (window as any).editReport = (id: number) => this.editReport(id);
  }


  //Init
  ngOnInit(): void {
    this.refreshData()
    this.getTypes()
    const that = this; // para referenciar metodos afuera de la datatable
    $('#reportsTable').on('click', 'a.dropdown-item', function(event) {
      const action = $(this).data('action');
      const id = $(this).data('id');
  
      switch(action) {
        case 'newSaction':
          that.newSanction(id);
          break;
      }
    })
    this.resetDates()
  }

  // Función para convertir la fecha al formato `YYYY-MM-DD`
  private formatDateToString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  resetDates() {
    const today = new Date();
    today.setDate(today.getDate() + 1); 
    this.filterDateEnd = this.formatDateToString(today);
  
    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    previousMonthDate.setDate(1); 
    previousMonthDate.setDate(previousMonthDate.getDate() + 1); 
    this.filterDateStart = this.formatDateToString(previousMonthDate);
  }


  //Combo de filtrado de estado
  // onFilter(event: Event) {
  //   const selectedValue = (event.target as HTMLSelectElement).value;

  //   this.reportfilter = this.report.filter(
  //     (c) => c.reportState == selectedValue
  //   );
  //   if (selectedValue == '') {
  //     this.reportfilter = this.report;
  //   }

  //   this.updateDataTable();
  // }


  //Manejo del Datatable
  updateDataTable() {
    if ($.fn.dataTable.isDataTable('#reportsTable')) {
      $('#reportsTable').DataTable().clear().destroy();
    }
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'DD/MM/YYYY').unix()
    let table = this.table = $('#reportsTable').DataTable({
      // Atributos de la tabla
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      order: [0, 'desc'],
      lengthMenu: [10, 25, 50],
      pageLength: 10,
      data: this.reportfilter, // Fuente de datos
      // Columnas de la tabla
      columns: [
        {
          data: 'createdDate',
          className: 'align-middle',
           render: (data) =>  moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          type: 'date-moment'
        },
        {
          data: 'reportState',
          className: 'align-middle',
          render: (data) =>`
            <div class="text-center">
              <div class="badge ${this.getStatusClass(data)} border rounded-pill">${data}</div>
            </div>`
        },
        {
          data: 'plotId',
          className: 'align-middle',
          render: (data) =>
            `<div class="text-end">${data}</div>`
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
          searchable: false, // Marquen esto en falso si no quieren que se intente filtrar por esta columna tambien
          render: (data) =>
            `<div class="text-center">
              <div class="btn-group">
                <div class="dropdown">
                  <button type="button" class="btn border border-2 bi-three-dots-vertical" data-bs-toggle="dropdown"></button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" onclick="viewReport(${data.id})">Ver más</a></li>
                    ${data.reportState === 'Abierto' || data.reportState === 'Nuevo' || data.reportState === 'Pendiente' ?
                      `<li><hr class="dropdown-divider"></li> <li><a class="dropdown-item" onclick="editReport(${data.id})">Editar</a></li>` : ''}
                      ${data.reportState === 'Abierto' || data.reportState === 'Pendiente' ?
                        `<li><a class="dropdown-item" data-action="newSaction" data-id="${data.id}"">Sancionar</a></li>` : ''}
                  </ul>
                </div>
              </div>
            </div>`
        }
      ],
      dom:
        '<"mb-3"t>' +                           // Tabla
        '<"d-flex justify-content-between"lp>', // Paginación
      language: {
        lengthMenu:`
          <select class="form-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
        zeroRecords: "No se encontraron resultados",
        loadingRecords: "Cargando...",
        processing: "Procesando...",
      },
      // Uso de botones para exportar
      buttons: [
        {
          extend: 'excel',
          text: 'Excel',
          className: 'btn btn-success export-excel-btn',
          title: 'Listado de Denuncias',
          exportOptions: {
            columns: [0, 1, 2, 3], // Esto indica las columnas que se van a exportar a excel
          },
        },
        {
          extend: 'pdf',
          text: 'PDF',
          className: 'btn btn-danger export-pdf-btn',
          title: 'Listado de denuncias',
          exportOptions: {
            columns: [0, 1, 2, 3], // Esto indica las columnas que se van a exportar a pdf
          },
        }
      ]
    });
    
    // Triggers para los botones de exportación
    $('#exportExcelBtn').on('click', function () {
      table.button('.buttons-excel').trigger();
    });
    
    $('#exportPdfBtn').on('click', function () {
      table.button('.buttons-pdf').trigger();
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


  //Metodo para filtrar la tabla en base a las 2 fechas
  filterData() {
    let filteredComplaints = [...this.report];  // Copiar los datos de las que no han sido filtradas aún
  
    // Filtrar por estado si se ha seleccionado alguno
    if (this.selectedState) {
      filteredComplaints = filteredComplaints.filter(
        (c) => c.reportState === this.selectedState
      );
    }
  
    // Filtrar por fecha si las fechas están definidas
    const startDate = this.filterDateStart ? new Date(this.filterDateStart) : null;
    const endDate = this.filterDateEnd ? new Date(this.filterDateEnd) : null;
  
    filteredComplaints = filteredComplaints.filter((item) => {
      const date = new Date(item.createdDate);
      if (isNaN(date.getTime())) {
        console.warn(`Fecha no válida: ${item.createdDate}`);
        return false;
      }
  
      const afterStartDate = !startDate || date >= startDate;
      const beforeEndDate = !endDate || date <= endDate;
  
      return afterStartDate && beforeEndDate;
    });
  
    // Actualiza los datos de la tabla
    this.reportfilter = filteredComplaints;
    this.updateDataTable(); // Llama a la función para actualizar la tabla
  }
  
  // Método para manejar la selección del estado
  onFilter(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedState = selectedValue; // Actualiza el valor del estado seleccionado
    this.filterData(); // Aplica los filtros
  }
  
  // Método para manejar el cambio de fechas
  filterDate() {
    this.filterData(); // Aplica los filtros de fecha y estado
  }

  eraseFilters(){
    this.refreshData();
    this.selectedState = '';
    this.searchTerm = '';
    this.resetDates();
  }


  //
  refreshData() {
    this.reportServices.getAllReports().subscribe(
      response => {
        this.report = response;
        this.reportfilter = this.report;
        this.updateDataTable()
        this.filterDate()
      }, error => {
        alert(error)
      }
    )
  }

  newSanction(id: number) {
    this.routingService.redirect(`main/sanctions/post-fine/${id}`, "Registrar Multa")
  }

  postRedirect(){
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

    if(selectedReport) {
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

  CreateDataTable() {
  //   if ($.fn.dataTable.isDataTable('#reportsTables')) {//creo que es por la funcion
  //     $('#reportsTables').DataTable().clear().destroy();
  //   }

  //   let table = $('#reportsTables').DataTable({
  //     data: this.reportfilter,
  //     columns: [
  //       {
  //         data: 'createdDate',
  //         render: (data) => this.reportServices.formatDate(data),
  //       },
  //       {
  //         data: 'reportState',
  //         render: (data) => `<div class="d-flex justify-content-center"><div class="${this.getStatusClass(data)} btn w-75 text-center border rounded-pill" >${data}</div></div>`
  //       },
  //       { data: 'plotId', render: (data) => ` <div class="text-start">Nro: ${data}</div>` },
  //       { data: 'description' },
  //       {
  //         data: null,
  //         render: (data) => `
  //              <div class="btn-group gap-2">
  //                   <div class="dropdown">
  //                       <button type="button" class="btn btn-light border border-2 bi-three-dots-vertical" data-bs-toggle="dropdown"></button>
  //                       <ul class="dropdown-menu">
  //                           <li><a class="dropdown-item" onclick="viewComplaint(${data.id})">Ver más</a> </li>
  //                           <li><hr class="dropdown-divider"></li>
  //                           <li><a class="dropdown-item" onclick="selectState('ATTACHED', ${data.id}, ${data.userId})">Marcar como Anexada</a></li>
  //                           <li><a class="dropdown-item" onclick="selectState('REJECTED', ${data.id}, ${data.userId})">Marcar como Rechazada</a></li>
  //                           <li><a class="dropdown-item" onclick="selectState('PENDING', ${data.id}, ${data.userId})">Marcar como Pendiente</a></li>
  //                           <li><hr class="dropdown-divider"></li>
                            
  //                       </ul>
  //                   </div>
  //               </div>`,
  //       }
  //     ],
  //     paging: true,
  //     pageLength: 10,
  //     lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
  //     dom: 't<"d-flex justify-content-between"<lf>"d-flex justify-content-between"p>',
  //     searching: false,
  //     language: {
  //       lengthMenu: '<select class="form-select">' +
  //         '<option value="5">5</option>' +
  //         '<option value="10">10</option>' +
  //         '<option value="25">25</option>' +
  //         '<option value="50">50</option>' +
  //         '<option value="-1">All</option>' +
  //         '</select>'
  //     },
  //     buttons: [
  //       {
  //         extend: 'excel',
  //         text: 'Excel',
  //         className: 'btn btn-success export-excel-btn',
  //         title: 'Listado de Denuncias',
  //         exportOptions: {
  //           columns: [0, 1, 2, 3],
  //         },
  //       },
  //       {
  //         extend: 'pdf',
  //         text: 'PDF',
  //         className: 'btn btn-danger export-pdf-btn',
  //         title: 'Listado de denuncias',
  //         exportOptions: {
  //           columns: [0, 1, 2, 3],
  //         },
  //       },
  //     ],
  //   });

  //   $('#exportExcelBtn').on('click', function () {
  //     table.button('.buttons-excel').trigger();
  //   });

  //   $('#exportPdfBtn').on('click', function () {
  //     table.button('.buttons-pdf').trigger();
  //   });
  // }

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
        console.log(this.states)
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
      head: [['Fecha de Creación', 'Estado', 'Descripción','Lote']],
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
      ['Fecha de Creación', 'Estado', 'Descripción','Lote']
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



}

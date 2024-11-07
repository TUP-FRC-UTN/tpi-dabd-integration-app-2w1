import { CommonModule } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';

// Imports de DataTable con soporte para Bootstrap 5
import $ from 'jquery';
import 'datatables.net-bs5'; // DataTables con Bootstrap 5
import 'datatables.net-buttons-bs5'; // Botones con estilos de Bootstrap 5
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';

//Si los estilos fallan (sobretodo en la paginacion) usen estos comandos
// npm uninstall datatables.net
// npm uninstall datatables.net-dt
// npm uninstall datatables.net-buttons-dt

// npm cache clean --force

// npm install datatables.net-bs5
// npm install datatables.net-buttons-bs5

//Imports propios de multas
import { PenaltiesModalConsultComplaintComponent } from '../modals/penalties-get-complaint-modal/penalties-get-complaint.component';
import { PenaltiesModalStateReasonComponent } from '../modals/penalties-update-stateReason-modal/penalties-update-stateReason-modal.component';
import { ComplaintService } from '../../../services/complaintsService/complaints.service';
import { ComplaintDto } from '../../../models/complaint';
import { RoutingService } from '../../../../common/services/routing.service';
import { CustomSelectComponent } from "../../../../common/components/custom-select/custom-select.component";
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-penalties-list-complaint',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgbModule, CustomSelectComponent],
  templateUrl: './penalties-list-complaints.component.html',
  styleUrl: './penalties-list-complaints.component.scss',
})
export class PenaltiesListComplaintComponent implements OnInit {
  //Variables
  Complaint: ComplaintDto[] = [];                 //Fuente de datos
  filterComplaint: ComplaintDto[] = [];           //Fuente de datos a mostrar
  filterComplaintsecond: ComplaintDto[] = [];           //Fuente de datos a mostrar
  //filterDateStart: Date = new Date();             //valor fecha inicio
  //filterDateEnd: Date = new Date();               //valor fecha fin
  states: { name: string; value: string }[] = [];  //Mapa de estados para el select
  table: any;                                     //Tabla base
  searchTerm: string = '';                        //Valor de la barra de busqueda
  filterDateStart: string='';
  filterDateEnd: string ='';
  selectedState: string = '';
  

  //Init
  ngOnInit(): void {
    this.refreshData();
    this.getTypes()
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

  //Constructor
  constructor(
    private router: Router,
    private _modal: NgbModal,
    private complaintService: ComplaintService,
    private routingService: RoutingService

  ) {
    (window as any).viewComplaint = (id: number) => this.viewComplaint(id);
    (window as any).changeState = (state: string, id: number, userId: number) =>
      this.changeState(state, id, userId);
  }


  //Combo de filtrado de estado
  // onFilter(event: Event) {
  //   const selectedValue = (event.target as HTMLSelectElement).value;

  //   this.filterComplaint = this.Complaint.filter(
  //     (c) => c.complaintState == selectedValue
  //   );
  //   if (selectedValue == '') {
  //     this.filterComplaint = this.Complaint;
  //   }

  //   this.updateDataTable();
  // }

  //Manejo del Datatable
  updateDataTable() {
    //TODO: Revisar si es necesario UTILIZAR ESTA CONFIGURACION
    if ($.fn.dataTable.isDataTable('#complaintsTable')) {
      $('#complaintsTable').DataTable().clear().destroy();
    }
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'DD/MM/YYYY').unix()
    let table = this.table = $('#complaintsTable').DataTable({
      //Atributos de la tabla
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      order: [0, 'desc'],
      lengthMenu: [10, 25, 50],
      pageLength: 10,
      data: this.filterComplaint, //Fuente de datos
      //Columnas de la tabla
      columns: [
        {
          data: 'createdDate',
          render: (data) =>  moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          type: 'date-moment'
        },
        {
          data: 'complaintState',
          className: 'align-middle',
          render: (data) => `
              <div class="text-center">
                <div class="badge ${this.getStatusClass(data)} border rounded-pill">${data}</div>
              </div>`
        },
        {
          data: 'description',
          className: 'align-middle',
          render: (data) =>
            `<div>${data}</div>`
        },
        {
          data: 'fileQuantity',
          className: 'align-middle',
          render: (data) =>
            `<i class="bi bi-paperclip"></i> ${data} Archivo adjunto`
        },
        {
          data: null,
          className: 'align-middle',
          searchable: false, //Marquen esto en falso si no quieren que se intente filtrar por esta columna tambien
          render: (data) =>
            `<div class="text-center">
               <div class="btn-group">
                 <div class="dropdown">
                   <button type="button" class="btn border border-2 bi-three-dots-vertical" data-bs-toggle="dropdown"></button>
                   <ul class="dropdown-menu">
                     <li><a class="dropdown-item" onclick="viewComplaint(${data.id})">Ver más</a></li>
                      ${data.complaintState == "Pendiente" ? `
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" onclick="changeState('REJECTED', ${data.id}, ${data.userId})">Marcar como Rechazada</a></li>` : ``}
                      </ul>
                 </div>
              </div>
             </div>`
        },
      ],
      dom:
        '<"mb-3"t>' +                           //Tabla
        '<"d-flex justify-content-between"lp>', //Paginacion
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
      //Uso de botones para exportar
      buttons: [
        {
          extend: 'excel',
          text: 'Excel',
          className: 'btn btn-success export-excel-btn',
          title: 'Listado de Denuncias',
          exportOptions: {
            columns: [0, 1, 2, 3], //Esto indica las columnas que se van a exportar a excel
          },
        },
        {
          extend: 'pdf',
          text: 'PDF',
          className: 'btn btn-danger export-pdf-btn',
          title: 'Listado de denuncias',
          exportOptions: {
            columns: [0, 1, 2, 3], //Esto indica las columnas que se van a exportar a pdf
          },
        }
      ]
    });


    //Triggers para los botones de exportacion
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
  filterComplaintData() {
    let filteredComplaints = [...this.Complaint];  // Copiar los datos de las que no han sido filtradas aún
  
    // Filtrar por estado si se ha seleccionado alguno
    if (this.selectedState) {
      filteredComplaints = filteredComplaints.filter(
        (c) => c.complaintState === this.selectedState
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
    this.filterComplaint = filteredComplaints;
    this.updateDataTable(); // Llama a la función para actualizar la tabla
  }
  
  // Método para manejar la selección del estado
  onFilter(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedState = selectedValue; // Actualiza el valor del estado seleccionado
    this.filterComplaintData(); // Aplica los filtros
  }
  
  // Método para manejar el cambio de fechas
  filterDate() {
    this.filterComplaintData(); // Aplica los filtros de fecha y estado
  }

  eraseFilters(){
    this.refreshData();
    this.selectedState = '';
    this.searchTerm = '';
    this.resetDates();
  }


  //Switch para manejar el estilo de los estados
  getStatusClass(estado: string): string {
    switch (estado) {
      case 'Anexada':
        return 'text-bg-secondary';
      case 'Nueva':
        return 'text-bg-success';
      case 'Pendiente':
        return 'text-bg-warning';
      case 'Rechazada':
        return 'text-bg-danger';
      default:
        return '';
    }
  }


  // Metodo para obtener el estado de la denuncia y mostrar el modal
  changeState(option: string, idComplaint: number, userId: number) {
    const newState = option;
    this.openModal(idComplaint, userId, newState);
  }


  //Metodos propios de nuestro micro:
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Consulta del listado
  refreshData() {
    this.complaintService.getAllComplaints().subscribe((data) => {
      this.Complaint = data;
      this.filterComplaint = [...data];
      this.updateDataTable();
      this.filterDate()
    });
  }


  //Carga del combo de estados para el filtro
  getTypes(): void {
    this.complaintService.getState().subscribe({
      next: (data) => {
        this.states = Object.keys(data).map(key => ({
          name: data[key],
          value: key
        }));
      },
      error: (error) => {
        console.error('error: ', error);
      }
    })
  }

  //Metodo para redireccionar a otra ruta
  redirect(path: string) {
    this.router.navigate([path]);
  }

  //Metodo para abrir modal de confirmacion de cambio de estado
  openModal(idComplaint: number, userId: number, complaintState: string) {
    const modal = this._modal.open(PenaltiesModalStateReasonComponent, {
      size: 'md',
      keyboard: false,
    });
    modal.componentInstance.idComplaint = idComplaint;
    modal.componentInstance.complaintState = complaintState;
    modal.componentInstance.userId = userId;
    modal.result
      .then((result) => {
        this.refreshData();
      })
      .catch((error) => {
        console.log("Error con modal: " + error);
      });
  }

  //Metodo para abrir el modal getById
  viewComplaint(i: number) {
    const modal = this._modal.open(PenaltiesModalConsultComplaintComponent, {
      size: 'xl',
      keyboard: false,
    });
    modal.componentInstance.denunciaId = i;
    modal.result
      .then((result) => { })
      .catch((error) => {
        console.log('Modal dismissed with error:', error);
      });
  }

  postRedirect() {
    this.routingService.redirect("main/complaints/post-complaint", "Registrar Denuncia")
  }

  /////////////////////////////////////////////////////////////////////
  //Metodos Para Exportar A pdf y Excel
  exportToPDF(): void {
    const doc = new jsPDF();
    const pageTitle = 'Listado de Denuncias';
    doc.setFontSize(18);
    doc.text(pageTitle, 15, 10);
    doc.setFontSize(12);

    const formattedDesde = this.complaintService.formatDate(this.filterDateStart);
    const formattedHasta = this.complaintService.formatDate(this.filterDateEnd);
    doc.text(`Fechas: Desde ${formattedDesde} hasta ${formattedHasta}`, 15, 20);

    const filteredData = this.filterComplaint.map((complaint: ComplaintDto) => {
      return [
        this.complaintService.formatDate(complaint.createdDate),
        complaint.complaintState,
        complaint.description,
        complaint.fileQuantity,
      ];
    });

    autoTable(doc, {
      head: [['Fecha de Creación', 'Estado', 'Descripción', 'Cantidad de Archivos']],
      body: filteredData,
      startY: 30,
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
    });

    doc.save(`${formattedDesde}-${formattedHasta}_Listado_Denuncias.pdf`);
  }

  //Exportar a Excel
  exportToExcel(): void {
    const encabezado = [
      ['Listado de Denuncias'],
      [`Fechas: Desde ${this.complaintService.formatDate(this.filterDateStart)} hasta ${this.complaintService.formatDate(this.filterDateEnd)}`],
      [],
      ['Fecha de Creación', 'Estado', 'Descripción', 'Cantidad de Archivos']
    ];
  
    const excelData = this.filterComplaint.map((complaint: ComplaintDto) => {
      return [
        this.complaintService.formatDate(complaint.createdDate),
        complaint.complaintState,
        complaint.description,
        complaint.fileQuantity,
      ];
    });
  
    const worksheetData = [...encabezado, ...excelData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    
    worksheet['!cols'] = [
      { wch: 20 }, // Fecha de Creación
      { wch: 20 }, // Estado
      { wch: 50 }, // Descripción
      { wch: 20 }, // Cantidad de Archivos
    ];
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Denuncias');
  
    XLSX.writeFile(workbook, `${this.complaintService.formatDate(this.filterDateStart)}-${this.complaintService.formatDate(this.filterDateEnd)}_Listado_Denuncias.xlsx`);
  }

}


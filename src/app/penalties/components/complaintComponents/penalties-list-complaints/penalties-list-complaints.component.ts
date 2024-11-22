import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModule, } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';

// Imports de DataTable con soporte para Bootstrap 5
import $ from 'jquery';
import 'datatables.net-bs5'; // DataTables con Bootstrap 5
// import 'datatables.net-buttons-bs5'; // Botones con estilos de Bootstrap 5
// import 'datatables.net-buttons/js/buttons.html5';
// import 'datatables.net-buttons/js/buttons.print';

//Imports propios de multas
import { PenaltiesModalConsultComplaintComponent } from '../modals/penalties-get-complaint-modal/penalties-get-complaint.component';
import { PenaltiesModalStateReasonComponent } from '../modals/penalties-update-stateReason-modal/penalties-update-stateReason-modal.component';
import { ComplaintService } from '../../../services/complaints.service';
import { ComplaintDto, PutStateComplaintDto } from '../../../models/complaint';
import { RoutingService } from '../../../../common/services/routing.service';
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import { AuthService } from '../../../../users/users-servicies/auth.service';


@Component({
  selector: 'app-penalties-list-complaint',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgbModule, CustomSelectComponent],
  templateUrl: './penalties-list-complaints.component.html',
  styleUrl: './penalties-list-complaints.component.scss',
})
export class PenaltiesListComplaintComponent implements OnInit {
  //Variables
  Complaint: ComplaintDto[] = [];                 //Lista de datos
  filterComplaint: ComplaintDto[] = [];           //Datos filtrados a mostrar
  filterComplaintsecond: ComplaintDto[] = [];     //Datos filtrados a mostrar 2??
  states: { key: string; value: string }[] = [];  //Lista de estados
  table: any;                                     //tabla base

  searchTerm: string = '';        //Valor de la barra de busqueda
  filterDateStart: string = '';   //Valor fecha inicio
  filterDateEnd: string = '';     //Valor fecha fin
  minDateEnd: string = '';        //Valor mínimo para la fecha fin
  selectedStates: string[] = [];  //Valor select

  options: { value: string, name: string }[] = []
  @ViewChild(CustomSelectComponent) customSelect!: CustomSelectComponent;

  //Constructor
  constructor(
    private _modal: NgbModal,
    private complaintService: ComplaintService,
    private routingService: RoutingService,
    private authService: AuthService
  ) {
    (window as any).viewComplaint = (id: number) => this.viewComplaint(id);
    (window as any).changeState = (state: string, id: number, userId: number) =>
      this.changeState(state, id, userId);
  }


  //Init
  ngOnInit(): void {
    this.refreshData();
    this.getStates();
    this.eraseFilters();
  }

  //Setea el valor default de las fechas
  resetDates() {
    const today = new Date();
    this.filterDateEnd = this.formatDateToString(today); // Fecha final con hora 00:00:00

    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    this.filterDateStart = this.formatDateToString(previousMonthDate); // Fecha de inicio con hora 00:00:00
  }
  get maxDate(): string {
    return this.formatDateToString(new Date());
  }
  //Función para convertir la fecha al formato `YYYY-MM-DD`
  formatDateToString(date: Date): string {
    // Crea una fecha ajustada a UTC-3 y establece la hora a 00:00:00 para evitar horas residuales
    const adjustedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    return adjustedDate.toLocaleDateString('en-CA'); // Formato `YYYY-MM-DD`
  }


  //Crea la tabla con sus configuraciones 
  updateDataTable() {
    if ($.fn.dataTable.isDataTable('#complaintsTable')) {
      $('#complaintsTable').DataTable().clear().destroy();
    }
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'DD/MM/YYYY').unix()
    let table = this.table = $('#complaintsTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      order: [0, 'desc'],
      lengthMenu: [5, 10, 25, 50],
      pageLength: 5,
      data: this.filterComplaint, //Fuente de datos
      columns: [
        {
          data: 'createdDate',
          render: (data, type, row) => {
            const boldClass = row.complaintState === 'Nueva' ? 'fw-bold' : '';
            return `<span class="${boldClass}">${moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY')}</span>`;
          },
          type: 'date-moment'
        },
        {
          data: 'complaintState',
          className: 'align-middle',
          render: (data) => {
            let displayText = data;
            let badgeClass = this.getStatusClass(data); 
            
            if (data === "Nueva") {
              displayText = "Pendiente"; 
              badgeClass = "badge bg-warning"; 
              
              return `
                <div class="text-center">
                  <div class="badge ${badgeClass} border rounded-pill text-body-emphasis">
                    ${displayText}
                  </div>
                </div>`;
            }
            
            return `
              <div class="text-center">
                <div class="badge ${badgeClass} border rounded-pill">${displayText}</div>
              </div>`;
          }
        },
        {
          data: 'description',
          className: 'align-middle',
          render: (data, type, row) => {
            const boldClass = row.complaintState === 'Nueva' ? 'fw-bold' : '';
            return `<div class="${boldClass}">${data}</div>`;
          }
        },
        {
          data: 'fileQuantity',
          className: 'align-middle',
          render: (data, type, row) => {
            const boldClass = row.complaintState === 'Nueva' ? 'fw-bold' : '';
            return `<i class="bi bi-paperclip ${boldClass}"></i> <span class="${boldClass}">${data} Archivo adjunto</span>`;
          }
        },
        {
          data: null,
          className: 'align-middle',
          searchable: false,
          render: (data, type, row) => {
            const boldClass = row.complaintState === 'Nueva' ? 'fw-bold' : '';
            return `
              <div class="text-center ${boldClass}">
                <div class="btn-group">
                  <div class="dropdown">
                    <button type="button" class="btn border border-2 bi-three-dots-vertical" data-bs-toggle="dropdown"></button>
                    <ul class="dropdown-menu">
                      <li><a class="dropdown-item" onclick="viewComplaint(${data.id})">Ver más</a></li>
                      ${data.complaintState === "Pendiente" ? `
                      <li><hr class="dropdown-divider"></li>
                      <li><a class="dropdown-item" onclick="changeState('REJECTED', ${data.id}, ${this.authService.getUser().id})">Rechazar</a></li>
                      <li><a class="dropdown-item" onclick="changeState('SOLVED', ${data.id}, ${this.authService.getUser().id})">Resuelta</a></li>` : ``}
                    </ul>
                  </div>
                </div>
              </div>`;
          }
        },
      ],
      dom:
        '<"mb-3"t>' +                           //Tabla
        '<"d-flex justify-content-between"lp>', //Paginacion
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
      },
    });
  }


  //Metodo para filtrar con la barra de busqueda
  onSearch(event: any) {
    const searchValue = event.target.value;

    //Dispara la busqueda despues del tercer caracter
    if (searchValue.length >= 3) {
      this.table.search(searchValue).draw();
    } else if (searchValue.length === 0) {
      this.table.search('').draw();
    }
  }


  //
  filterComplaintData() {
    let filteredComplaints = [...this.Complaint];  // Copiar los datos de las que no han sido filtradas aún

    //Filtra por los estados
    if (this.selectedStates.length > 0) {
      filteredComplaints = filteredComplaints.filter(
        (c) => this.selectedStates.includes(c.complaintState)
      );
    }

    //Filtra por un rango de fechas
    const startDate = this.filterDateStart ? new Date(this.filterDateStart + 'T00:00:00') : null;
    let endDate = this.filterDateEnd ? new Date(this.filterDateEnd + 'T23:59:59') : null;

    filteredComplaints = filteredComplaints.filter((item) => {
      const date = new Date(item.createdDate);
      if (isNaN(date.getTime())) {
        console.warn(`Fecha no válida: ${item.createdDate}`);
        return false;
      }

      const afterStartDate = !startDate || date >= startDate;
      const beforeEndDate = !endDate || date <= endDate;

      return afterStartDate && beforeEndDate; //Retorna true solo si se cumplen ambas condiciones
    });

    this.filterComplaint = filteredComplaints;
    this.updateDataTable();
  }


  //Actualiza los valores seleccionados del select y filtra
  onFilter(data: any) {
    this.selectedStates = data;
    this.filterComplaintData();
  }


  //Método para manejar el cambio de fechas
  filterDate() {
    const today = new Date();
    const startDate = new Date(this.filterDateStart);
    const endDate = new Date(this.filterDateEnd);

    if (startDate > today) {
      this.filterDateStart = this.formatDateToString(today);
    }

    if (endDate > today) {
      this.filterDateEnd = this.formatDateToString(today);
    }

    this.minDateEnd = this.filterDateStart; // Establecer el valor mínimo para la fecha fin

    this.filterComplaintData();
  }


  //Limpia los filtros
  eraseFilters() {
    this.refreshData();
    this.selectedStates = [];
    this.searchTerm = '';
    this.resetDates();
    if (this.customSelect) {
      this.customSelect.setData(this.selectedStates);
    }
  }


  //Retorna los estilos basados en los estados
  getStatusClass(estado: string): string {
    switch (estado) {
      case 'Anexada':
        return 'text-bg-secondary';
      case 'Nueva':
        return 'text-bg-success';
      case 'Pendiente':
        return 'text-bg-warning';
      case 'Resuelta':
        return 'text-bg-primary';
      case 'Rechazada':
        return 'text-bg-danger';
      default:
        return '';
    }
  }


  //Metodo para actualizar el estado de una denuncia
  changeState(option: string, idComplaint: number, userId: number) {
    const newState = option;
    this.openModal(idComplaint, userId, newState);
  }



  //Metodos propios de nuestro micro:
  ////////////////////////////////////////////////////////////////////////////////////////////////////////


  //Consulta los datos del listado con la api
  refreshData() {
    this.complaintService.getAllComplaints().subscribe((data) => {
      this.Complaint = data;
      this.filterComplaint = [...data];
      this.updateDataTable();
      this.filterDate()
    });
  }


  //Trae los estados desde la api
  getStates(): void {
    this.complaintService.getState().subscribe({
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


  //Abre el modal para cambiar el estado de la denuncia
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


  //Abre el modal con todos los datos de la denuncia
  viewComplaint(i: number) {
    const modal = this._modal.open(PenaltiesModalConsultComplaintComponent, {
      size: 'xl',
      keyboard: false,
    });
    modal.componentInstance.denunciaId = i;
    modal.result
      .then((result) => { this.refreshData() })
      .catch((error) => {
        console.log('Modal se cerro con un error: ', error);
      });
  }


  //Redirige a la pagina para dar de alta una denuncia
  postRedirect() {
    this.routingService.redirect("main/complaints/post-complaint", "Registrar Denuncia")
  }


  //Exporta la tabla a PDF
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


  //Exporta la tabla a Excel
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
      { wch: 20 }, //Fecha 
      { wch: 20 }, //Estado
      { wch: 50 }, //Descripcion
      { wch: 20 }, //Cantidad de archivos adjuntos
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Denuncias');

    XLSX.writeFile(workbook, `${this.complaintService.formatDate(this.filterDateStart)}-${this.complaintService.formatDate(this.filterDateEnd)}_Listado_Denuncias.xlsx`);
  }

}


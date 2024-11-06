import { CommonModule } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

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
import moment from 'moment';

@Component({
  selector: 'app-penalties-list-complaint',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgbModule],
  templateUrl: './penalties-list-complaints.component.html',
  styleUrl: './penalties-list-complaints.component.scss',
})
export class PenaltiesListComplaintComponent implements OnInit {
eraseFilters() {
throw new Error('Method not implemented.');
}
  //Variables
  Complaint: ComplaintDto[] = [];                 //Fuente de datos
  filterComplaint: ComplaintDto[] = [];           //Fuente de datos a mostrar
  //filterDateStart: Date = new Date();             //valor fecha inicio
  //filterDateEnd: Date = new Date();               //valor fecha fin
  states: { key: string; value: string }[] = [];  //Mapa de estados para el select
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
  resetDates(){
    const today = new Date();
    this.filterDateEnd = this.formatDateToString(today);

    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
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
  onFilter(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;

    this.filterComplaint = this.Complaint.filter(
      (c) => c.complaintState == selectedValue
    );
    if (selectedValue == '') {
      this.filterComplaint = this.Complaint;
    }

    this.updateDataTable();
  }

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
  filterDate() {
    const startDate = this.filterDateStart ? new Date(this.filterDateStart) : null;
    const endDate = this.filterDateEnd ? new Date(this.filterDateEnd) : null;

    this.filterComplaint = this.Complaint.filter(item => {
      const date = new Date(item.createdDate);

      if (isNaN(date.getTime())) {
        console.warn(`Fecha no valida: ${item.createdDate}`);
        return false;
      }

      //Comprobar limites de fecha
      const afterStartDate = !startDate || date >= startDate;
      const beforeEndDate = !endDate || date <= endDate;

      return afterStartDate && beforeEndDate; //Retorna verdadero solo si ambas condiciones se cumplen
    });

    this.updateDataTable();
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
          key,
          value: data[key]
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
}


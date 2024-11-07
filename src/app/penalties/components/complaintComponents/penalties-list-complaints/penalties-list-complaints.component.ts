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
  Complaint: ComplaintDto[] = [];                 //Data Souce
  filterComplaint: ComplaintDto[] = [];           //Data Source to show (filtered)
  filterComplaintsecond: ComplaintDto[] = [];           //Second data source to show (filtered)
  // filterDateStart: Date = new Date();             //Start Date value
  // filterDateEnd: Date = new Date();               //End Date value
  states: { key: string; value: string }[] = [];  //States array for the select
  table: any;                                     //Base table
  searchTerm: string = '';                        //Search bar value


  filterDateStart: string=''; //Start Date value

  filterDateEnd: string =''; //End Date value
  selectedState: string = '';
  

  //Init
  ngOnInit(): void {
    this.refreshData();
    this.getTypes()
    this.resetDates()
  }

  // This method is used to convert
  //a date to a formatted string.

  //Param 'date' is the date to convert.
  
  //Returns the date in this 
  //string format: `YYYY-MM-DD`.
  private formatDateToString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  
  //Resets the date filters.
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

  //This method is used to 
  //update the table.

  //If the table is already created, it 
  //is destroyed and created again.
  updateDataTable() {
    //TODO: Revisar si es necesario UTILIZAR ESTA CONFIGURACION
    if ($.fn.dataTable.isDataTable('#complaintsTable')) {
      $('#complaintsTable').DataTable().clear().destroy();
    }
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'DD/MM/YYYY').unix()
    let table = this.table = $('#complaintsTable').DataTable({
      //These are the 
      //table attributes.
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      order: [0, 'desc'],
      lengthMenu: [10, 25, 50],
      pageLength: 10,
      data: this.filterComplaint, //Data source
      //Table columns
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
          searchable: false, //This is false to indicate 
          render: (data) =>  //that this column is not searchable.
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
        '<"mb-3"t>' +                           //Table
        '<"d-flex justify-content-between"lp>', //Pagination
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
      //This sets the buttons to export 
      //the table data to Excel and PDF.
      buttons: [
        {
          extend: 'excel',
          text: 'Excel',
          className: 'btn btn-success export-excel-btn',
          title: 'Listado de Denuncias',
          exportOptions: {
            columns: [0, 1, 2, 3], //This indicates the columns that will be exported to Excel.
          },
        },
        {
          extend: 'pdf',
          text: 'PDF',
          className: 'btn btn-danger export-pdf-btn',
          title: 'Listado de denuncias',
          exportOptions: {
            columns: [0, 1, 2, 3], //This indicates the columns that will be exported to PDF.
          },
        }
      ]
    });


    //These methods are used to export 
    //the table data to Excel and PDF.

    //They are activated by
    //clicks in the buttons.

    //Returns the table data exported 
    //to the desired format.
    $('#exportExcelBtn').on('click', function () {
      table.button('.buttons-excel').trigger();
    });

    $('#exportPdfBtn').on('click', function () {
      table.button('.buttons-pdf').trigger();
    });
  }


  //Method to search in the table
  //based on the search term.

  //Param 'event' is the event 
  //that triggers the method.

  //Returns the table filtered.
  onSearch(event: any) {
    const searchValue = event.target.value;

    //Checks if the search term has 3 or more characters.
    if (searchValue.length >= 3) {
      this.table.search(searchValue).draw();
    } else if (searchValue.length === 0) {
      this.table.search('').draw();
    }
  }


  // Method to filter the table
  // based on the 2 dates.

  // Returns true only if the complaint
  // date is between the 2 dates.
  filterComplaintData() {
    let filteredComplaints = [...this.Complaint];  // Copiar los datos de las que no han sido filtradas aún
  
    // Filtrar por estado si se ha seleccionado alguno
    if (this.selectedState) {
      filteredComplaints = filteredComplaints.filter(
        (c) => c.complaintState === this.selectedState
      );
    }

    // Checks if the date is 
    // between the start and end date.
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
  
      return afterStartDate && beforeEndDate; //Returns true only if both conditions are met.
    });
  
    // This methos updates 
    // the table data
    this.filterComplaint = filteredComplaints;
    this.updateDataTable(); // Calls the function to
                            // update the table.
  }



  //This method filters the table 
  //by the complaint state.

  //Param 'event' is the event 
  //that triggers the method.

  //Updates the table using the filters.
  onFilter(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedState = selectedValue; // Actualiza el valor del estado seleccionado
    this.filterComplaintData(); // Aplica los filtros
  }
  
  
  // Método para manejar el cambio de fechas
  filterDate() {
    this.filterComplaintData(); // Aplica los filtros de fecha y estado
  }


  //This method is used to return the 
  //filters to their default values.
  eraseFilters(){
    this.refreshData();
    this.selectedState = '';
    this.searchTerm = '';
    this.resetDates();
  }

  
  //This method is used to get
  //styles based on the complaint state.

  //Param 'estado' is the 
  //complaint state.

  //Returns the class for the state.
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


  // Method to get the complaint 
  // state and show the modal.

  // Param 'option' is the new state that the complaint is
  // being changed to (e.g., "ATTACHED", "REJECTED", "PENDING").
  // Param 'idComplaint' is the complaint id.
  // Param 'userId' is the user id 
  // associated with the complaint.

  //Returns the modal to change the state.
  changeState(option: string, idComplaint: number, userId: number) {
    const newState = option;
    this.openModal(idComplaint, userId, newState);
  }


  //Metodos propios de nuestro micro:
  ////////////////////////////////////////////////////////////////////////////////////////////////////////


  //List queries.
  //This method is used to 
  //refresh the data in the table.
  refreshData() {
    this.complaintService.getAllComplaints().subscribe((data) => {
      this.Complaint = data;
      this.filterComplaint = [...data];
      this.updateDataTable();
      this.filterDate()
    });
  }




  //Loads the 'states' array with 
  //the complaint states for the filter.
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


  //Method to redirect 
  //to another route.

  //Param 'path' is the 
  //route to redirect to.
  redirect(path: string) {
    this.router.navigate([path]);
  }


  //Opens the modal to change 
  //the complaint state.

  //Param 'idComplaint' is the id of the complaint
  //that's going to be visualized in the modal.
  //Param 'userId' is the user id 
  //which the complaint belongs to.
  //Param 'complaintState' is the 
  //current state of the complaint.

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

  //Opens the modal to 
  //get the complaint by id.

  //Param 'i' is the 
  //complaint id.
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
  // This method is used to export the complaint list to PDF.

  // Returns the complaint list in PDF format.
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

  /////////////////////////////////////////////////////////////////////
  // This method is used to export the complaint list to Excel.

  // Returns the complaint list in Excel format.
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
      { wch: 20 }, // Creation Date
      { wch: 20 }, // State
      { wch: 50 }, // Description
      { wch: 20 }, // File Amount
    ];
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Denuncias');
  
    XLSX.writeFile(workbook, `${this.complaintService.formatDate(this.filterDateStart)}-${this.complaintService.formatDate(this.filterDateEnd)}_Listado_Denuncias.xlsx`);
  }

}


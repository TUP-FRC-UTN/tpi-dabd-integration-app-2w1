import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PenaltiesSanctionsServicesService } from '../../../services/sanctionsService/sanctions.service';
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
import 'datatables.net-buttons-bs5'; // Botones con estilos de Bootstrap 5
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import { RoutingService } from '../../../../common/services/routing.service';
import moment from 'moment';

import jsPDF from 'jspdf';
import { SanctionsDTO } from '../../../models/SanctionsDTO';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-penalties-sanctions-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgbModule, RouterModule],
  templateUrl: './penalties-list-sanctions.component.html',
  styleUrl: './penalties-list-sanctions.component.scss'
})
export class PenaltiesSanctionsListComponent implements OnInit {
  //Variables
  sanctionsfilter: any[] = [];                    //
  sanctions: SanctionsDTO[] = [];                          //
  sanctionState: String = '';                     //
  selectedValue: string = '';                     //
  // filterDateStart: Date = new Date();             //
  // filterDateEnd: Date = new Date();               //
  states: { key: string; value: string }[] = [];  //
  table: any;                                     //Tabla base
  searchTerm: string = '';                        //Valor de la barra de busqueda
  filterDateStart: string='';
  filterDateEnd: string ='';
  
  selectedState: string = '';

  //Init
  ngOnInit(): void {
    //Metodo para recargar la datatable desde dentro de un modal en el modal
    this.sanctionService.refreshTable$.subscribe(() => {
      this.refreshData();
    });

    this.getTypes()
    this.refreshData()
    //Esto es para acceder al metodo desde afuera del datatable
    const that = this; // para referenciar metodos afuera de la datatable
    $('#sanctionsTable').on('click', 'a.dropdown-item', function(event) {
      const action = $(this).data('action');
      const id = $(this).data('id');
      const state = $(this).data('state');
  
      switch(action) {
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

  // Función para convertir la fecha al formato `YYYY-MM-DD`
  private formatDateToString(date: Date): string {
    return date.toISOString().split('T')[0];
  }



  //Constructor
  constructor(
    private router: Router,
    private _modal: NgbModal,
    private sanctionService: PenaltiesSanctionsServicesService,
    private routingService: RoutingService
  ) {
    //Esto es importante para llamar los funciones dentro del data table con onClick
    (window as any).viewFine = (id: number) => this.viewFine(id);
    // (window as any).selectState = (state: string, id: number, userId: number) =>
    //   this.selectState(state, id, userId);
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
      lengthMenu: [10, 25, 50],
      pageLength: 10,
      data: this.sanctionsfilter, // Fuente de datos
      // Columnas de la tabla
      columns: [
        {
          data: 'createdDate',
          className: 'align-middle',
           render: (data) =>  moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY'),
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
            `<div class="text-end">${data}</div>`
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
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" data-action="updateFine" data-id="${data.id}"'>Editar</a></li>
                            ${data.fineState == "Pendiente" ? `<li><a class="dropdown-item" data-action="newDisclaimer" data-id="${data.id}">Descargo</a></li>` : ``}
                          </ul>
                        </div>
                      </div>
                    </div>`;
          }
        }
      ],
      dom: '<"mb-3"t>' + '<"d-flex justify-content-between"lp>', // Tabla y paginación
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
        processing: "Procesando..."
      },
      // Uso de botones para exportar
      buttons: [
        {
          extend: 'excel',
          text: 'Excel',
          className: 'btn btn-success export-excel-btn',
          title: 'Listado de Multas y Advertencias',
          exportOptions: {
            columns: [0, 1, 2, 3, 4] // Columnas a exportar
          }
        },
        {
          extend: 'pdf',
          text: 'PDF',
          className: 'btn btn-danger export-pdf-btn',
          title: 'Listado de Multas y Advertencias',
          exportOptions: {
            columns: [0, 1, 2, 3, 4] // Columnas a exportar
          }
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
  ///////////////////////////////////////////////////////////////////////////////////////

  viewFine(i:number){
    const modal = this._modal.open(PenaltiesModalFineComponent, {
      size: 'xl',
      keyboard: false,
    });
    modal.componentInstance.fineId = i;
    modal.result
      .then((result:any) => { })
      .catch((error: any) => {
        console.log('Modal dismissed with error:', error);
      });
  }
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
      .catch((error:any) => {
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
  if (this.selectedState) {
    if (this.selectedState === 'Advertencia') {
      // Filtrar por estado 'Advertencia' y por elementos con fineState == null
      filteredComplaints = filteredComplaints.filter(
        (c) => c.fineState === this.selectedState || c.fineState === null
      );
    } else {
      // Filtrar por el estado seleccionado (no 'Advertencia')
      filteredComplaints = filteredComplaints.filter(
        (c) => c.fineState === this.selectedState
      );
    }
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

  // Actualiza los datos filtrados en la tabla
  this.sanctionsfilter = filteredComplaints;
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



  //ToDo: Esto esta desactualizado o son los de los informes (arreglar mas tarde)
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

  refreshData() {
    this.sanctionService.getAllSactions().subscribe((data) => {
      this.sanctions = data;
      this.sanctionsfilter = [...data];
      this.updateDataTable();
      this.filterDate()
    });
  }



  redirect(path: string) {
    this.router.navigate([path]);
  }

  newDisclaimer(id: number) {
    this.routingService.redirect(`main/sanctions/post-disclaimer/${id}`, "Registrar Descargo")
  }

  changeState(id: number, state:string) {
    this.openModalStateReason(id, state);
  }

  updateFine(id: number) {
    this.routingService.redirect(`main/sanctions/put-fine/${id}`, "Actualizar Multa")
  }

  
  openModalStateReason(id: number, state:string) {
    const modal = this._modal.open(PenaltiesUpdateStateReasonModalComponent, {
      size: 'md',
      keyboard: false,
    });
    modal.componentInstance.id = id;
    modal.componentInstance.fineState = state;
    modal.result
      .then((result:any) => {
        if(result.stateUpdated){
          this.refreshData();
        }
      })
      .catch((error:any) => {
        console.log("Error con modal: " + error);
      });
  }
  
  getTypes(): void {
    this.sanctionService.getStateFines().subscribe({
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


  ///////////////////////////////////////////////////////////////////
    //Metodos Para Exportar A pdf y Excel
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
        head: [['Fecha de Creación', 'Estado', 'Descripción','Lote', 'Monto a pagar']],
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
        ['Fecha de Creación', 'Estado', 'Descripción','Lote', 'Monto a pagar']
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

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PenaltiesSanctionsServicesService } from '../../../services/sanctionsService/sanctions.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  sanctions: any[] = [];                          //
  sanctionState: String = '';                     //
  selectedValue: string = '';                     //
  filterDateStart: Date = new Date();             //
  filterDateEnd: Date = new Date();               //
  states: { key: string; value: string }[] = [];  //
  table: any;                                     //Tabla base
  searchTerm: string = '';                        //Valor de la barra de busqueda


  //Init
  ngOnInit(): void {
    //Metodo para recargar la datatable desde dentro de un modal en el modal
    this.sanctionService.refreshTable$.subscribe(() => {
      this.refreshData();
    });

    
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

  //Combo de filtrado de estado
  onFilter(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;

    this.sanctionsfilter = this.sanctions.filter(
      (c) => c.complaintState == selectedValue
    );
    if (selectedValue == '') {
      this.sanctionsfilter = this.sanctions;
    }

    this.updateDataTable();
  }


  ///////////////////////////////////////////////////////////////////////////////////////
  //Manejo del Datatable
  updateDataTable() {
    if ($.fn.dataTable.isDataTable('#sanctionsTable')) {
      $('#sanctionsTable').DataTable().clear().destroy();
    }
    
    let table = this.table = $('#sanctionsTable').DataTable({
      // Atributos de la tabla
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      order: [0, 'asc'],
      lengthMenu: [10, 25, 50],
      pageLength: 10,
      data: this.sanctionsfilter, // Fuente de datos
      // Columnas de la tabla
      columns: [
        {
          data: 'createdDate',
          className: 'align-middle',
          render: (data) =>
            `<div>${this.sanctionService.formatDate(data)}</div>`
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


  //Metodo para filtrar la tabla en base a las 2 fechas
  filterDate() {
    const startDate = this.filterDateStart ? new Date(this.filterDateStart) : null;
    const endDate = this.filterDateEnd ? new Date(this.filterDateEnd) : null;

    this.sanctionsfilter = this.sanctions.filter(item => {
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
    });
  }



  redirect(path: string) {
    this.router.navigate([path]);
  }

  newDisclaimer(id: number) {
    this.routingService.redirect(`main/penalties/sanctions/post-disclaimer/${id}`, "Registrar Descargo")
  }

  changeState(id: number, state:string) {
    this.openModalStateReason(id, state);
  }

  updateFine(id: number) {
    this.routingService.redirect(`main/penalties/sanctions/put-fine/${id}`, "Actualizar Multa")
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
    this.sanctionService.getState().subscribe({
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

}

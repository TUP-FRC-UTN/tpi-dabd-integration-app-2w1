import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TutorialService } from '../../../../common/services/tutorial.service';
import { finalize, Subject, Subscription, takeUntil } from 'rxjs';
import Shepherd from 'shepherd.js';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';
import { PlotService } from '../../../users-servicies/plot.service';
import { GetBuyRequestDto } from '../../../users-models/plot/GetBuyRequestDto';
import { GetPlotModel } from '../../../users-models/plot/GetPlot';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
@Component({
  selector: 'app-users-buy-request',
  standalone: true,
  imports: [],
  templateUrl: './users-buy-request.component.html',
  styleUrl: './users-buy-request.component.scss'
})
export class UsersBuyRequestComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  private readonly suscriptionService = inject(SuscriptionManagerService);
  private readonly plotService = inject(PlotService);
  requests: GetBuyRequestDto[] = [];
  plots: GetPlotModel[] = [];
  table: any;
  //searchTerm: string = '';
  isLoading: boolean =false;
  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  constructor(
    private tutorialService: TutorialService,
    private cdRef: ChangeDetectorRef
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
  }
  onSearch(event: any) {
    const searchValue = event.target.value;

    if (searchValue.length >= 3) {
      this.table.search(searchValue).draw();
    } else if (searchValue.length === 0) {
      this.table.search('').draw();
    }
  }
  ngOnDestroy(): void {
    this.tutorialSubscription.unsubscribe();
    if (this.tour) {
      this.tour.complete();
    }

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit() : void {
    const that = this;
    this.configDataTable();
    this.getAllRequests();

    //TUTORIAL
    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );

  }

  //------------------------------------Carga de datos------------------------------------
  
  getAllRequests(){
    this.isLoading = true
    this.plotService.getAllBuyRequests().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdRef.detectChanges();
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (response: GetBuyRequestDto[]) => { 
        this.requests = response;
        console.log("data:",response)
        this.loadAllRequests();
      },
      error: (error) =>{
        console.error("Error get all request:",error);
      }
    })
  }

  loadAllRequests(){
    const dataTable = $('#myTableRequests').DataTable();
    dataTable.clear().rows.add(this.requests).draw();
  }

  //------------------------------------Acciones------------------------------------

  changeState(id : number){
    const sus = this.plotService.changeStateBuyRequest(id).subscribe({
      next: () => {
        console.log('Se actualizo el estado');
        this.getAllRequests();
      },
      error: (error) => {
        console.error('Error al cambiar el estado:', error);
      }
    });

    //Agregar servicio
    this.suscriptionService.addSuscription(sus);
  }
  //------------------------------------Exportar------------------------------------
  exportToExcel(): void {
    const table = $('#myTableRequests').DataTable();
    const filteredData = table.rows({ search: 'applied' }).data().toArray();

    const excelData = filteredData.map(request => {
      return {
        'Fecha': moment(request.request_date).format('DD/MM/YYYY'),
        'Lote': request.plot_number,
        'Manzana': request.block_number,
        'Nombre': request.name,
        'Email': `${request.email || 'N/A'}`,
        'Teléfono': `${request.phone || 'N/A'}`,
        'Observaciones': `${request.observations || 'N/A'}`,
        'Estado': `${request.contacted ? 'Contactado' : 'No contactado'}`
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitudes');

    
    const fileName = `ConsultaPorLotes.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }
  exportToPDF(): void {
    const doc = new jsPDF();

    const pageTitle = 'Consultas por Lotes';
    doc.setFontSize(18);
    doc.text(pageTitle, 15, 10);
    doc.setFontSize(12);

    doc.text(`Consultas por Lotes`, 15, 20);

    const table = $('#myTableRequests').DataTable();
    const filteredData = table.rows({ search: 'applied' }).data().toArray();

    const pdfData = filteredData.map(request => {
      return [
        moment(request.request_date).format('DD/MM/YYYY'),
        request.plot_number,
        request.block_number,
        request.name,
        `${request.email || 'N/A'}`,
        `${request.phone || 'N/A'}`,
        `${request.observations || 'N/A'}`,
        `${request.contacted ? 'Contactado' : 'No contactado'}`
      ];
    });

    let pageCount = 0;

    (doc as any).autoTable({
      head: [['Fecha', 'Lote', 'Manzana', 'Nombre', 'Email', 'Teléfono', 'Observaciones', 'Estado']],
      body: pdfData,
      startY: 30,
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
      didDrawPage: function (data: any) {
        pageCount++;
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || pageSize.getHeight();

        doc.setFontSize(10);
        const text = `Página ${pageCount}`;
        const textWidth = doc.getTextWidth(text);
        doc.text(text, (pageSize.width / 2) - (textWidth / 2), pageHeight - 10);
      }
    });

    
    const fileName = `ConsultaPorLotes.pdf`;
    doc.save(fileName);
  }
  //------------------------------------Tutorial------------------------------------

  startTutorial() {
    console.log('EMPEZANDO TUTORIAL');
    this.tour.addStep({
      id: 'profile-step',
      title: 'Lista de solicitudes',
      text: 'Acá puede ver una lista de las solicitudes de lotes, con los datos de contacto de los interesados.',

      attachTo: {
        element: '#myTableRequests',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'edit-step',
      title: 'Filtros',
      text: 'Desde acá podrá filtrar los lotes. También puede exportar la lista a Excel o PDF, o borrar los filtros aplicados con el botón de basura.',
      attachTo: {
        element: '#filters',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'profile-step',
      title: 'Acciones',
      text: 'Desde acá puede ver las acciones disponibles para cada lote. Puede editar el perfil, borrar el usuario o ver más información.',

      attachTo: {
        element: '#actions',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'profile-step',
      title: 'Agregar',
      text: 'Para agregar una propiedad, pulse este botón y será enviado al alta de lotes.',

      attachTo: {
        element: '#addPlot',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Finalizar',
          action: this.tour.complete,
        },
      ],
    });

    this.tour.start();
  }
  configDataTable() {
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'DD/MM/YYYY').unix();

    if ($.fn.DataTable.isDataTable('#myTableRequests')) {
      $('#myTableRequests').DataTable().clear().destroy();
    }

    this.table = $('#myTableRequests').DataTable({
      // Atributos de la tabla
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      order: [0, 'desc'], // Ordenar por fecha por defecto
      lengthMenu: [5, 10, 25, 50],
      pageLength: 5,
      data: this.requests,

      // Columnas de la tabla
      columns: [
        {
          data: 'request_date',
          title: 'Fecha',
          className: 'align-middle',
          render: (data) => moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          type: 'date-moment'
        },
        {
          data: 'plot_number',
          title: 'Lote',
          className: 'align-middle',
          render: (data) => `<div>${data}</div>`
        },
        {
          data: 'block_number',
          title: 'Manzana',
          className: 'align-middle',
          render: (data) => `<div>${data}</div>`
        },
        {
          data: 'name',
          title: 'Nombre',
          className: 'align-middle',
          render: (data) => `<div>${data}</div>`
        },
        {
          data: 'email',
          title: 'Email',
          className: 'align-middle',
          render: (data) => `<div>${data || 'N/A'}</div>`
        },
        {
          data: 'phone',
          title: 'Teléfono',
          className: 'align-middle',
          render: (data) => `<div>${data || 'N/A'}</div>`
        },
        {
          data: 'observations',
          title: 'Observaciones',
          className: 'align-middle',
          render: (data) => `<div>${data || 'N/A'}</div>`
        },
        {
          data: 'contacted',
          title: 'Estado',
          className: 'align-middle',
          render: (data) => {
            if(data){
              return `<div>Contactado</div>`
            }else{
              return `<div>No Contactado</div>`
            }
          }
        },
        {
          title: "Acciones",
          data: null,
          orderable: false,
          className: 'text-center',
          render: function (data, type, row) {
            return (data.contacted ? `<button type="button" class="btn btn-light text-primary bi-check-all fs-5" disabled></button>`: `<button type="button" class="btn-changeState btn btn-light bi-check fs-5" data-action="changeState" data-id="${data.id}"></button>`);
          }
        }
      ],

      // Configuración del DOM y diseño
      dom:
        '<"mb-3"t>' +                           // Tabla
        '<"d-flex justify-content-between"lp>', // Paginación

      // Configuración del lenguaje
      language: {
        lengthMenu: `
          <select class="form-select">
          <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
        search: 'Buscar:',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        infoEmpty: "Mostrando 0 registros",
        infoFiltered: "(filtrado de _MAX_ registros totales)",

        zeroRecords: 'No se encontraron resultados',
        emptyTable: 'No hay datos disponibles',
        loadingRecords: "Cargando...",
        processing: "Procesando..."
      }
    });
    $('#myTableRequests tbody').on('click', '.btn-changeState', (event) => {
      console.log("click",event)
      const row = this.table.row($(event.currentTarget).parents('tr'));
      const rowData = row.data();
      if (rowData) {
        this.changeState(rowData.id);
      }

    });
  }
}

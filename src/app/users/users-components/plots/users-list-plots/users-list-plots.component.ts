import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { PlotService } from '../../../users-servicies/plot.service';
import { GetPlotModel } from '../../../users-models/plot/GetPlot';
import { UsersModaInfoPlotComponent } from '../users-moda-info-plot/users-moda-info-plot.component';
import { PlotStateModel } from '../../../users-models/plot/PlotState';
import { PlotTypeModel } from '../../../users-models/plot/PlotType';
import { OwnerService } from '../../../users-servicies/owner.service';
import { Owner } from '../../../users-models/owner/Owner';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';
import { RoutingService } from '../../../../common/services/routing.service';
import { UsersTransferPlotComponent } from "../users-transfer-plot/users-transfer-plot.component";
import { UserService } from '../../../users-servicies/user.service';
import { GetuserDto } from '../../../users-models/users/GetUserDto';
import { UserGet } from '../../../users-models/users/UserGet';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

@Component({
  selector: 'app-users-list-plots',
  standalone: true,
  imports: [ReactiveFormsModule, CustomSelectComponent, UsersTransferPlotComponent],
  templateUrl: './users-list-plots.component.html',
  styleUrl: './users-list-plots.component.css'
})
export class UsersListPlotsComponent implements OnInit, OnDestroy {

  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;
  
  plots: GetPlotModel[] = [];
  private readonly plotService = inject(PlotService);
  private readonly ownerService = inject(OwnerService);
  private readonly userService = inject(UserService);
  showDeactivateModal: boolean = false;
  userToDeactivate: number = 0;

  //Filtros
  selectType = new FormControl();
  selectState = new FormControl();

  plotTypes: string[] = [];
  plotStatus: string[] = [];
  typesForFilter: any[] = [];
  statusForFilter: any[] = [];

  @ViewChild('customSelectType') customSelectType!: CustomSelectComponent;
  @ViewChild('customSelectState') customSelectState!: CustomSelectComponent;

  private readonly suscriptionService = inject(SuscriptionManagerService);
  private readonly routingService = inject(RoutingService);

  constructor(private modal: NgbModal, private tutorialService: TutorialService
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
        scrollTo: {
          behavior: 'smooth',
          block: 'center'
        }
      },
      keyboardNavigation: false,

      useModalOverlay: true,
    }); 
 }

  ngOnDestroy(): void {
    this.suscriptionService.unsubscribeAll();

    this.tutorialSubscription.unsubscribe();
    if (this.tour) {
      this.tour.complete();
    }

    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }

  async ngOnInit() {
      //TUTORIAL
      this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
        () => {
          this.startTutorial();
        }
      ); 

      
    this.loadAllPlotsStates();
    this.loadAllPlotsTypes();


    const sus = this.plotService.getAllPlots().subscribe({
      next: async (data: GetPlotModel[]) => {
        this.plots = data;

        // Crear un arreglo de promesas para obtener los propietarios
        const ownerPromises = this.plots.map(async plot => {
          return await this.showOwner(plot.id); // Esperar el nombre del propietario
        });

        // Esperar a que todas las promesas se resuelvan
        const owners = await Promise.all(ownerPromises);

        // Inicializar DataTables después de cargar todos los datos
        setTimeout(() => {
          const table = $('#myTablePlot').DataTable({
            paging: true,
            searching: true,
            ordering: true,
            lengthChange: true,
            lengthMenu: [5, 10, 25, 50],
            order: [[0, 'asc']],
            pageLength: 5,
            data: this.plots.map((plot, index) => [
              `<p class="text-end">${plot.plot_number}<p/>`,
              `<p class="text-end">${plot.block_number}<p/>`,
              ` <p class="text-end">${plot.total_area_in_m2} m²<p/>`,
              `<p class="text-end">${plot.built_area_in_m2} m²<p/>`,
              this.showPlotType(plot.plot_type),
              this.showPlotState(plot.plot_state),
              owners[index] // Usar el nombre del propietario cargado
            ]),
            columns: [
              { title: 'Lote', width: '10%', className: 'text-end' },
              { title: 'Manzana', width: '10%', className: 'text-end' },
              { title: 'Mts.2 Terreno', width: '15%', className: 'text-end' },
              { title: 'Mts.2 Construidos', width: '15%', className: 'text-end' },
              { title: 'Tipo Lote', width: '15%', className: 'text-center' },
              { title: 'Estado', width: '15%', className: 'text-center' },
              { title: 'Propietario', width: '15%', className: 'text-start' }, // Nueva columna
              {
          title: 'Acciones',
          orderable: false,
          width: '15%',
          className: 'text-center',
          render: (data, type, row, meta) => {
            const plotId = this.plots[meta.row].id;
            return `
              <div class="dropdown-center d-flex align-items-center justify-content-center">
                <button class="btn btn-light border border-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="actions">
            <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu">
            <li><a class="dropdown-item view-plot" data-id="${plotId}">Ver más</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item edit-plot" data-id="${plotId}">Editar</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item transfer-plot" data-id="${plotId}" >Transferir</a></li>
                </ul>
              </div>
            `;
          }
              }
            ],
            dom: '<"mb-3"t>' + '<"d-flex justify-content-between"lp>',
            language: {
              lengthMenu: "_MENU_",
              zeroRecords: "No se encontraron resultados",
              info: "Mostrando página _PAGE_ de _PAGES_",
              infoEmpty: "No hay registros disponibles",
              infoFiltered: "(filtrado de _MAX_ registros totales)",
              search: "Buscar:",
              loadingRecords: "Cargando...",
              processing: "Procesando...",
              emptyTable: "No hay datos disponibles en la tabla"
            },
          });

          // Alinear la caja de búsqueda a la derecha
          const searchInputWrapper = $('#myTable_filterPlot');
          searchInputWrapper.addClass('d-flex justify-content-start');

          // Desvincular el comportamiento predeterminado de búsqueda
          $('#myTable_filterPlot input').unbind();
          $('#myTable_filterPlot input').bind('input', (event) => {
            const searchValue = (event.target as HTMLInputElement).value;
            if (searchValue.length >= 2) {
              table.search(searchValue).draw();
            } else {
              table.search('').draw();
            }
          });

          // Asignar eventos a los botones "Ver más" y "Editar"
          $('#myTablePlot').on('click', '.view-plot', (event) => {
            const plotId = $(event.currentTarget).data('id');
            this.openModal(plotId);
          });

          $('#myTablePlot').on('click', '.edit-plot', (event) => {
            const plotId = $(event.currentTarget).data('id');
            this.redirectEdit(plotId);
          });
          
          $('#myTablePlot').on('click', '.transfer-plot', (event) => {
            const plotId = $(event.currentTarget).data('id');

            const modalRef = this.modal.open(UsersTransferPlotComponent, { size: 'xs', keyboard: false });
            modalRef.componentInstance.plotId = plotId;

            modalRef.result.then((result) => {
              this.loadPlots();
              });
            });

        }, 0);
      },
      error: (error) => {
        console.error('Error al cargar los lotes:', error);
      }
    });

    //Agregar servicio
    this.suscriptionService.addSuscription(sus);

  }
  startTutorial() {
    if (this.tour) {
      this.tour.complete();
    }

    // CÓDIGO PARA PREVENIR SCROLLEO DURANTE TUTORIAL
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    const restoreScroll = () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };

    // Al empezar, lo desactiva
    this.tour.on('start', () => {
      document.body.style.overflow = 'hidden';
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });
    });

    // Al completar lo reactiva, al igual que al cancelar
    this.tour.on('complete', restoreScroll);
    this.tour.on('cancel', restoreScroll);
    
    console.log('EMPEZANDO TUTORIAL');
    this.tour.addStep({
      id: 'profile-step',
      title: 'Lista de lotes',
      text: 'Acá puede ver una lista de los lotes presentes en el barrio, junto con su ubicación, sus datos de construcción, su estado actual y su propietario.',

      attachTo: {
        element: '#myTablePlot',
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
        element: '#filtros',
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
  //--------------------------------------------------Carga de datos--------------------------------------------------

  loadPlots() {
    const sus = this.plotService.getAllPlots().subscribe({
      next: async (data: GetPlotModel[]) => {
        this.plots = data;
        const dataTable = $('#myTablePlot').DataTable();
        const ownerPromises = this.plots.map(async plot => {
          return await this.showOwner(plot.id); // Esperar el nombre del propietario
        });

        // Esperar a que todas las promesas se resuelvan 
        const owners = await Promise.all(ownerPromises);
        const algo = this.plots.map((plot, index) => [ 
          `<p class="text-end">${plot.plot_number}<p/>`,
          `<p class="text-end">${plot.block_number}<p/>`,
          ` <p class="text-end">${plot.total_area_in_m2} m²<p/>`,
          `<p class="text-end">${plot.built_area_in_m2} m²<p/>`,
          this.showPlotType(plot.plot_type),
          this.showPlotState(plot.plot_state),
          owners[index] // Usar el nombre del propietario cargado
        ])
        dataTable.clear().rows.add(algo).draw();
      },
      error: (error) => {
        console.error('Error al cargar los estados:', error);
      }
    });

    //Agregar servicio
    this.suscriptionService.addSuscription(sus);
  }


  //Cargar estados de los lotes
  loadAllPlotsStates() {
    const sus = this.plotService.getAllStates().subscribe({
      next: (data: PlotStateModel[]) => {

        this.plotStatus = data.map(state => state.name);

        this.statusForFilter = data.map(r => ({
          value: r.name,
          name: r.name
        }));
      },
      error: (error) => {
        console.error('Error al cargar los estados:', error);
      }
    });

    //Agregar servicio
    this.suscriptionService.addSuscription(sus);
  }

  //Cargar tipos de los lotes
  loadAllPlotsTypes() {
    const sus = this.plotService.getAllTypes().subscribe({
      next: (data: PlotTypeModel[]) => {
        this.plotTypes = data.map(type => type.name);

        this.typesForFilter = data.map(r => ({
          value: r.name,
          name: r.name
        }));
      },
      error: (error) => {
        console.error('Error al cargar los tipos:', error);
      }
    });

    //Agregar servicio
    this.suscriptionService.addSuscription(sus);
  }

  //Obtener el propietario por id
  async showOwner(plotId: number): Promise<string> {
    return new Promise<string>((resolve) => {
      const sus = this.ownerService.getOwnerByPlotId(plotId).subscribe({
        next: (data: Owner[]) => {
          if (data.length > 0) {
            resolve(data[0].lastname + ', ' + data[0].name);
          } else {
            resolve('Sin propietario');
          }
        },
        error: (error) => {
          console.error('Error al cargar el propietario:', error);
          resolve('Error al cargar propietario');
        }
      });
      //Agregar servicio
      this.suscriptionService.addSuscription(sus);
    });
  }


  //--------------------------------------------------Filtros------------------------------------------------

  //Filtrar por tipo
  updateFilterType(options: any[]) {
    // Asignamos directamente los roles emitidos
    var optionsFilter = options.map((option: any) => option).join('|'); // Usar '|' para permitir múltiples filtros
    const table = $('#myTablePlot').DataTable();

    // Filtrar por el contenido de la columna de tipo de lote, teniendo en cuenta que puede tener unicamente 1 valor, pero se tiene que filtrar x varios
    table.column(4).search(optionsFilter, true, false).draw(); // Usar expresión regular para permitir múltiples filtros
  }

  //Filtrar por tipo
  updateFilterTypeSimple(filter : any[]) {
    const table = $('#myTablePlot').DataTable();
    table.column(4).search((this.selectType.value as string[]).join(' ') ?? '').draw();
  }

  //Filtrar por estado
  updateFilterStateSimple() {
    const table = $('#myTablePlot').DataTable();
    table.column(5).search((this.selectState.value as string[]).join(' ') ?? '').draw();
  }

  //Filtrar por estado
  updateFilterState(options: any[]) {
    // Asignamos directamente los roles emitidos
    var optionsFilter = options.map((option: any) => option).join('|'); // Usar '|' para permitir múltiples filtros
    const table = $('#myTablePlot').DataTable();

    // Filtrar por el contenido de la columna de tipo de lote, teniendo en cuenta que puede tener unicamente 1 valor, pero se tiene que filtrar x varios
    table.column(5).search(optionsFilter, true, false).draw(); // Usar expresión regular para permitir múltiples filtros
  }

  //Limpiar filtros
  resetFilters() {
    // Reiniciar el valor de los controles de filtro
    this.selectType.setValue([]);
    this.selectState.setValue([]);

    // Limpiar el campo de búsqueda general y los filtros de las columnas
    const searchInput = document.querySelector('#myTable_filterPlot input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = ''; 
    }
    const table = $('#myTablePlot').DataTable();

    if (this.customSelectState) {
      this.customSelectState.setData([]); // Reiniciar datos del custom select
    }
    if(this.customSelectType){
      this.customSelectType.setData([]); // Reiniciar datos del custom select
    }

    // Limpiar búsqueda y filtros
    table.search('').draw();
    table.columns().search('').draw();
  }

  //--------------------------------------------------Exportar------------------------------------------------

  //Exporta a pdf la tabla
  exportPdf() {
    //Mantener la orientación del documento en portrait
    const doc = new jsPDF('portrait');

    //Agregar título centrado con la fecha actual a la derecha
    const title = 'Lista de Lotes';
    doc.setFontSize(18);
    doc.text(title, 15, 20);
    doc.setFontSize(12);

    const today = new Date();
    const formattedDate =
      today.getDate().toString().padStart(2, '0') + '/' +
      (today.getMonth() + 1).toString().padStart(2, '0') + '/' +
      today.getFullYear();
    doc.text(`Fecha: ${formattedDate}`, 15, 30);

    //Configuración del título
    const titleText = `${title}`;

    //Definir las columnas de la tabla
    const columns = ['Lote', 'Manzana', 'M2 Totales', 'M2 Construidos', 'Tipo', 'Estado', 'Propietario'];

    //Obtener los datos filtrados en la tabla HTML
    const table = $('#myTablePlot').DataTable();
    const visibleRows = table.rows({ search: 'applied' }).data().toArray();

    //Mapear los datos visibles para el PDF
    const rows = visibleRows.map((row: any) => [
      `${this.getContentBetweenArrows(row[0])}`,
      `${this.getContentBetweenArrows(row[1])}`,
      `${this.getContentBetweenArrows(row[2])}`,
      `${this.getContentBetweenArrows(row[3])}`,
      `${this.getContentBetweenArrows(row[4])}`,
      `${this.getContentBetweenArrows(row[5])}`,
      `${row[6]}`
    ]);

    // Configuración de autoTable en modo portrait, con fuente y padding reducidos
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 35,
      theme: 'grid', // Reducción de fuente y padding
      margin: { top: 30, bottom: 20 }, // Márgenes más ajustados
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { cellWidth: 30 }
      },
    });

    // Guardar el PDF con la fecha actual en el nombre
    const fileName = `${formattedDate}_listado_lotes.pdf`;
    doc.save(fileName);
  }

  //Exporta a excel la tabla
  exportExcel() {
    //Obtenemos los datos visibles de la tabla (basados en los filtros aplicados)
    const table = $('#myTablePlot').DataTable();
    const visibleRows = table.rows({ search: 'applied' }).data().toArray();

    const today = new Date();
    const formattedDate =
      today.getDate().toString().padStart(2, '0') + '/' +
      (today.getMonth() + 1).toString().padStart(2, '0') + '/' +
      today.getFullYear();

    //Preparamos los datos en formato adecuado para Excel
    const rows = visibleRows.map((row: any) => [
      `${this.getContentBetweenArrows(row[0])}`,
      `${this.getContentBetweenArrows(row[1])}`,
      `${this.getContentBetweenArrows(row[2])}`,
      `${this.getContentBetweenArrows(row[3])}`,
      `${this.getContentBetweenArrows(row[4])}`,
      `${this.getContentBetweenArrows(row[5])}`,
      `${row[6]}`  //Propietario
    ]);

    //Definimos las columnas para el archivo Excel
    const header = ['Lote', 'Manzana', 'M2 Totales', 'M2 Construidos', 'Tipo', 'Estado', 'Propietario'];

    //Creamos la hoja de Excel
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([header, ...rows]);

    //Creamos un libro de trabajo con la hoja
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lista de Lotes');

    //Exportamos el archivo Excel
    const fileName = `${formattedDate}_listado_lotes.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  //--------------------------------------------------Modal------------------------------------------------

  //Abre el modal con la información del lote
  async openModal(plotId: number) {
    console.log("Esperando a que userModal se cargue...");

    // Espera a que se cargue el usuario seleccionado
    try {
      await this.selectUser(plotId);
      // Una vez cargado, abre el modal
      const modalRef = this.modal.open(UsersModaInfoPlotComponent, { size: 'lg', keyboard: false });
      modalRef.componentInstance.plotModel = this.plotModel;

      modalRef.result.then((result) => {
        $('#myTablePlot').DataTable().ajax.reload();
      });

    } catch (error) {
      console.error('Error al abrir el modal:', error);
    }
  }

  // Busca el user y se lo pasa al modal
  plotModel: GetPlotModel = new GetPlotModel();
  selectUser(id: number): Promise<GetPlotModel> {
    return new Promise((resolve, reject) => {
      this.plotService.getPlotById(id).subscribe({
        next: (data: GetPlotModel) => {
          this.plotModel = data;
          Swal.close();
          resolve(data);
        },
        error: (error) => {
          console.error('Error al cargar el lote:', error);
          reject(error);
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al cargar el lote. Por favor, inténtalo de nuevo.',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    });
  }

  //--------------------------------------------------Estilos------------------------------------------------

  //Establece un estilo según el tipo de lote
  showPlotType(plotType: any): string {
    let color: string = ''

    switch (plotType) {
      case "Comercial":
        color = "text-bg-secondary";
        break;
      case "Residencial":
        color = "text-bg-success";
        break;
      case "Baldio":
        color = "text-bg-danger";
        break;
    }
    return `<div class="d-flex justify-content-center"> <span class='badge rounded-pill ${color}'>${plotType}</span> </div>`;
  }

  //Establece un estilo según el estado del lote
  showPlotState(plotState: any): string {
    let color: string = ''

    switch (plotState) {
      case "Disponible":
        color = "text-bg-success";
        break;
      case "Habitado":
        color = "text-bg-secondary";
        break;
      case "En construccion":
        color = "text-bg-danger";
        break;
    }

    return `<div class="d-flex justify-content-center"> <span class='${color} badge rounded-pill'>${plotState}</span></div>`;
  }

  //Quedarse sólo con el contenido entre las etiquetas de los elementos
  getContentBetweenArrows(input: string): string[] {
    const matches = [...input.matchAll(/>(.*?)</g)];
    const cleanedResults = matches
      .map(match => match[1].trim()) //Elimina los espacios al inicio y al final de cada elemento
      .filter(content => content !== ""); //Filtra los elementos que solo sean espacios o estén vacíos

    return cleanedResults;
  }

  //--------------------------------------------------Redirecciones------------------------------------------------

    // Redirige a la vista para agregar lote
    addPlot() {
      this.routingService.redirect('/main/plots/add', 'Registrar Lote');
    }

    // Redirige a la vista para editar el lote
    redirectEdit(id: number) {
      this.routingService.redirect(`/main/plots/edit/${id}`, 'Actualizar Lote');
    }
}

import { Component, OnDestroy, ViewChild } from '@angular/core';
import { inject } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { OwnerService } from '../../../users-servicies/owner.service';
import { Owner } from '../../../users-models/owner/Owner';
import { UsersModalInfoOwnerComponent } from '../users-modal-info-owner/users-modal-info-owner.component';
import { OwnerTypeModel } from '../../../users-models/owner/OwnerType';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { GetPlotDto } from '../../../users-models/plot/GetPlotDto';
import { PlotService } from '../../../users-servicies/plot.service';
import { ModalEliminarOwnerComponent } from '../users-modal-delete-owner/users-modal-delete-owner.component';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import moment from 'moment';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';
import { RoutingService } from '../../../../common/services/routing.service';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

@Component({
  selector: 'app-users-list-owners',
  standalone: true,
  imports: [ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './users-list-owners.component.html',
  styleUrl: './users-list-owners.component.css',
})
export class UsersListOwnersComponent implements OnDestroy {
  owners: Owner[] = [];

  private readonly apiService = inject(OwnerService);
  private readonly plotService = inject(PlotService);
  private readonly suscriptionService = inject(SuscriptionManagerService);
  private readonly routingService = inject(RoutingService);

  @ViewChild(CustomSelectComponent) customSelect!: CustomSelectComponent;

  showDeactivateModal: boolean = false;
  userToDeactivate: number = 0;
  types: any[] = [];
  maxDate = new Date(new Date().setHours(new Date().getHours() - 3))
    .toISOString()
    .split('T')[0];
  minDate: string = new Date(new Date().setDate(new Date().getDate() - 30))
    .toISOString()
    .split('T')[0];
  selectType: FormControl = new FormControl([]);
  initialDate: FormControl = new FormControl(this.minDate);
  endDate: FormControl = new FormControl(this.maxDate);

  plots: GetPlotDto[] = [];
  ownersWithPlots: any[] = [];

  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  //Desuscribirse
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

  constructor(private modal: NgbModal, private tutorialService: TutorialService) {
    const fecha = new Date();

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

  async ngOnInit() {
    // Convertir Observable en Promesa y esperar que se resuelva
    const sus1 = this.apiService.getAllWithTheirPlots().subscribe({
      next: (data: Owner[]) => {
        this.ownersWithPlots = data;
      },
    });

    //Agrego suscripcion
    this.suscriptionService.addSuscription(sus1);

    const sus2 = this.apiService.getAll().subscribe({
      next: async (data: Owner[]) => {
        // Cambiar guiones por barras en la fecha de nacimiento
        this.owners = data.map((owner) => ({
          ...owner,
          create_date: owner.create_date.replace(/-/g, '/'),
        }));

        this.loadTypes();

        //Agrego suscripcion
        this.suscriptionService.addSuscription(sus2);

        // Esperar a que todas las promesas de loadPlots se resuelvan
        const plotsData = await Promise.all(
          this.owners.map(async (owner) => [
            ` ${owner.lastname}, ${owner.name}`,
            `${owner.dni_type}`,
            `<p class="text-end"> ${owner.dni}<p/>`,
            //owner.ownerType,
            this.showOwerType(owner.ownerType),
            await this.loadPlots(owner.id), // Espera a que loadPlots se resuelva
            owner.id,
          ])
        );

        // Inicializar DataTables después de cargar los datos
        setTimeout(() => {
          const table = $('#myTableOwners').DataTable({
            paging: true,
            searching: true,
            ordering: true,
            lengthChange: true,
            lengthMenu: [5, 10, 25, 50],
            order: [[0, 'asc']],
            pageLength: 5,
            columns: [
              { title: 'Nombre', width: '15%', className: 'text-start' },
              {
                title: 'Tipo Documento',
                width: '10%',
                className: 'text-start',
              },
              { title: 'Documento', width: '15%', className: 'text-end' },
              { title: 'Tipo', width: '15%', className: 'text-center' },
              { title: 'Lotes', width: '10%', className: 'text-start' },
              {
                title: 'Acciones',
                orderable: false,
                width: '15%',
                className: 'text-center',
                render: (data, type, row, meta) => {
                  const ownerId = this.owners[meta.row].id;
                  return `
                    <div class="dropdown-center d-flex align-items-center justify-content-center text-center">
                      <button class="btn btn-light border border-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="actions">
                        <i class="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul class="dropdown-menu">
                        <li><a class="dropdown-item view-owner" data-id="${ownerId}">Ver más</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item edit-owner" data-id="${ownerId}">Editar</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item delete-owner" data-id="${meta.row}">Eliminar</a></li>
                      </ul>
                    </div>
                  `;
                },
              },
            ],
            data: plotsData, // Usar los datos resueltos
            dom: '<"mb-3"t>' + '<"d-flex justify-content-between"lp>',

            language: {
              lengthMenu: '_MENU_',
              zeroRecords: 'No se encontraron resultados',
              info: 'Mostrando página _PAGE_ de _PAGES_',
              infoEmpty: 'No hay registros disponibles',
              infoFiltered: '(filtrado de _MAX_ registros totales)',
              search: 'Buscar:',
              loadingRecords: 'Cargando...',
              processing: 'Procesando...',
              emptyTable: 'No hay datos disponibles en la tabla',
            },
          });

          // Alinear la caja de búsqueda a la derecha
          const searchInputWrapper = $('#myTable_filter_Owners');
          searchInputWrapper.addClass('d-flex justify-content-start');

          table.order([0, 'asc']).draw(); // Ordenar por fecha de creación de forma descendente

          // Desvincular el comportamiento predeterminado de búsqueda
          $('#myTable_filter_Owners input').unbind();
          $('#myTable_filter_Owners input').bind('input', (event) => {
            const searchValue = (event.target as HTMLInputElement).value;

            // Comienza a buscar solo si hay 3 o más caracteres
            if (searchValue.length >= 3) {
              table.search(searchValue).draw();
            } else {
              table.search('').draw(); // Limpia la búsqueda si hay menos de 3 caracteres
            }
          });

          // Asignar el evento click a los botones "Ver más"
          $('#myTableOwners').on('click', '.view-owner', (event) => {
            const ownerId = $(event.currentTarget).data('id');
            this.abrirModal(ownerId);
          });

          // Asignar el evento click a los botones "Editar"
          $('#myTableOwners').on('click', '.edit-owner', (event) => {
            const userId = $(event.currentTarget).data('id');
            this.redirectEdit(userId);
          });

          $('#myTableOwners').on('click', '.delete-owner', (event) => {
            const id = $(event.currentTarget).data('id');
            const userId = this.owners[id].id; //Obtén el ID real del usuario
            this.openModalEliminar(userId); //Pasa el ID del usuario al abrir el modal
          });
        }, 0); // Asegurar que la tabla se inicializa en el próximo ciclo del evento
      },
      error: (error) => {
        console.error('Error al cargar los lotes:', error);
      },
    });

    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );

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
    
    this.tour.addStep({
      id: 'profile-step',
      title: 'Lista de propietarios',
      text: 'Acá puede ver una lista de todos los propietarios del barrio. Se diferenfia entre persona fisica y persona jurídica. También se muestra la lista de lotes qu tiene el propietario.',

      attachTo: {
        element: '#myTableOwners',
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
      text: 'Desde acá podrá filtrar los propietarios. También puede exportar la lista a Excel o PDF, o borrar los filtros aplicados con el botón de basura.',
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
      text: 'Desde acá puede ver las acciones disponibles para cada usuario. Puede editar el perfil, borrar el usuario o ver más información.',

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
      text: 'Para agregar un nuevo propietario, pulse este botón y será enviado al alta de propietarios.',

      attachTo: {
        element: '#addOwner',
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

  showOwerType(ownerType: string) {
    let color = '';

    switch (ownerType) {
      case 'Persona Fisica':
        color = 'text-bg-primary';
        break;
      case 'Persona Juridica':
        color = 'text-bg-danger';
        break;
    }
    return `<span class='badge rounded-pill ${color}'>${ownerType}</span>`;
  }

  async loadPlots(ownerId: number): Promise<string> {
    this.plots = (await this.plotService.getAllPlots().toPromise()) || [];

    let plots = this.ownersWithPlots.find((owner) => owner.owner.id == ownerId);

    let response = '';

    for (let i = 0; i < plots.plot.length; i++) {
      response +=
        this.plots.find((plot) => plot.id == plots.plot[i])?.plot_number +
          ', ' || '';
    }

    response = response.substring(0, response.length - 2);
    return response;
  }

  async abrirModal(ownerId: number) {
    // Espera a que se cargue el usuario seleccionado
    try {
      await this.selectOwner(ownerId);

      // Una vez cargado, abre el modal
      const modalRef = this.modal.open(UsersModalInfoOwnerComponent, {
        size: 'lg',
        keyboard: false,
      });
      modalRef.componentInstance.ownerModel = this.ownerModel;

      modalRef.result.then((result) => {
        $('#myTableOwners').DataTable().ajax.reload();
      });
    } catch (error) {
      console.error('Error al abrir el modal:', error);
    }
  }

  //Redirigir a la vista de agregar propietario
  addOwner() {
    this.routingService.redirect('main/owners/add', 'Registrar Propietario');
  }

  //Redirigir a la vista de editar propietario
  redirectEdit(id: number) {
    this.routingService.redirect(
      `/main/owners/edit/${id}`,
      'Actualizar Propietario'
    );
  }

  //Carga los tipos de propietarios
  loadTypes() {
    const sus3 = this.apiService.getAllTypes().subscribe({
      next: (data: OwnerTypeModel[]) => {
        this.types = data.map((type) => ({
          value: type.description,
          name: type.description,
        }));
      },
      error: (error) => {
        console.error('Error al cargar los tipos:', error);
      },
    });

    //Agrego suscripcion
    this.suscriptionService.addSuscription(sus3);
  }

  async openModalEliminar(userId: number) {
    const modalRef = this.modal.open(ModalEliminarOwnerComponent, {
      size: 'md',
      keyboard: false,
    });
    modalRef.componentInstance.userModal = { id: userId };

    // Escuchar el evento de eliminación para recargar los usuarios
    modalRef.componentInstance.userDeleted.subscribe(() => {
      this.loadTable(); // Recargar los usuarios después de eliminar
    });
  }

  //Cargar tabla
  loadTable() {
    // Destruir la instancia de DataTable si ya existe
    if ($.fn.dataTable.isDataTable('#myTableOwners')) {
      $('#myTableOwners').DataTable().clear().destroy();
    }
    this.ngOnInit();
  }

  resetFilters() {
    // Reiniciar el valor del control de tipo y fechas
    this.selectType.setValue('');
    this.initialDate.setValue(this.minDate); // Restablecer fecha inicial
    this.endDate.setValue(this.maxDate); // Restablecer fecha final

    // Limpiar el campo de búsqueda general
    const searchInput = document.querySelector(
      '#myTable_filter_Owners input'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = ''; // Limpiar el valor del input de búsqueda general
    }

    // Obtener la instancia de DataTable
    const table = $('#myTableOwners').DataTable();

    // Limpiar búsqueda general y filtros de columnas
    table.search('').draw(); // Limpiar búsqueda general
    table.column(3).search('').draw(); // Limpiar filtro de tipo
    table.column(0).search('').draw(); // Limpiar filtro de fecha

    if (this.customSelect) {
      this.customSelect.setData([]); // Reiniciar datos del custom select
    }

    // Eliminar la función de filtro personalizada de fechas
    $.fn.dataTable.ext.search.splice(0, $.fn.dataTable.ext.search.length);

    // Redibujar la tabla sin filtros
    table.draw();
  }

  updateFilterType(options: any[]) {
    // Asignamos directamente los roles emitidos
    var optionsFilter = options.map((option: any) => option).join('|'); // Usar '|' para permitir múltiples filtros
    const table = $('#myTableOwners').DataTable();

    console.log(optionsFilter);

    // Filtrar por el contenido de la columna de tipo de lote, teniendo en cuenta que puede tener unicamente 1 valor, pero se tiene que filtrar x varios
    table.column(3).search(optionsFilter, true, false).draw(); // Usar expresión regular para permitir múltiples filtros
  }

  getContentBetweenArrows(input: string): string[] {
    const matches = [...input.matchAll(/>(.*?)</g)];
    return matches.map((match) => match[1]).filter((content) => content !== '');
  }

  //Metodo para filtrar la tabla en base a las 2 fechas
  filterByDate() {
    const table = $('#myTableOwners').DataTable();

    // Convertir las fechas seleccionadas a objetos Date para comparar
    const start = this.initialDate.value
      ? new Date(this.initialDate.value).toISOString().split('T')[0]
      : null;
    const end = this.endDate.value
      ? new Date(this.endDate.value).toISOString().split('T')[0]
      : null;

    // Limpiar cualquier filtro previo relacionado con fechas
    $.fn.dataTable.ext.search.splice(0, $.fn.dataTable.ext.search.length);

    // Agregar una nueva función de filtro
    $.fn.dataTable.ext.search.push(
      (settings: any, data: any, dataIndex: any) => {
        // Convertir la fecha de la fila (data[0]) a un objeto Date
        const rowDateParts = data[0].split('/'); // Asumiendo que la fecha está en formato DD/MM/YYYY
        const rowDate = new Date(
          `${rowDateParts[2]}-${rowDateParts[1]}-${rowDateParts[0]}`
        )
          .toISOString()
          .split('T')[0]; // Convertir a formato YYYY-MM-DD

        // Realizar las comparaciones
        if (start && rowDate < start) return false;
        if (end && rowDate > end) return false;
        return true;
      }
    );

    // Redibujar la tabla con el filtro aplicado
    table.draw();
  }

  // Busca el user y se lo pasa al modal
  ownerModel: Owner = new Owner();
  selectOwner(id: number): Promise<Owner> {
    return new Promise((resolve, reject) => {
      this.apiService.getById(id).subscribe({
        next: (data: Owner) => {
          this.ownerModel = data;
          Swal.close(); // Cerrar SweetAlert
          resolve(data); // Resuelve la promesa cuando los datos se cargan
        },
        error: (error) => {
          console.error('Error al cargar el propietario:', error);
          reject(error); // Rechaza la promesa si ocurre un error
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al cargar el propietario. Por favor, inténtalo de nuevo.',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        },
      });
    });
  }

  private formatDate(date: Date): string {
    // Obtener la zona horaria de Argentina (UTC-3)
    const argentinaOffset = 3 * 60; // Argentina está a UTC-3, por lo que el offset es 3 horas * 60 minutos

    // Ajustar la fecha a la zona horaria de Argentina, estableciendo la hora en 00:00
    const localDate = new Date(
      date.getTime() + (argentinaOffset - date.getTimezoneOffset()) * 60000
    );

    // Establecer la hora en 00:00 para evitar cambios de fecha no deseados
    localDate.setHours(0, 0, 0, 0);

    // Sumar un día
    localDate.setDate(localDate.getDate());

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    return new Intl.DateTimeFormat('es-ES', options).format(localDate);
  }

  exportPdf() {
    const doc = new jsPDF();

    // Agregar título centrado
    const title = 'Lista de Propietarios';
    doc.setFontSize(18);
    doc.text(title, 15, 20);
    doc.setFontSize(12);

    const today = this.formatDate(new Date());
    doc.text(`Fecha: ${today}`, 15, 30);

    // Definir columnas para el PDF
    const columns = ['Nombre', 'Tipo Documento', 'Documento', 'Tipo', 'Lotes'];

    // Filtrar datos visibles en la tabla
    const table = $('#myTableOwners').DataTable();

    // Obtener las filas visibles de la tabla
    const visibleRows = table.rows({ search: 'applied' }).data().toArray();

    // Mapear los datos visibles a un formato adecuado para jsPDF
    const rows = visibleRows.map((row: any) => [
      `${row[0]}`,
      `${row[1]}`,
      `${this.getContentBetweenArrows(row[2])}`,
      `${this.getContentBetweenArrows(row[3])}`,
      `${row[4]}`,
    ]);

    // Generar la tabla en el PDF usando autoTable
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 35,
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
      },
    });

    // Guardar el PDF con el nombre dinámico
    doc.save(`${today}_listado_propietarios.pdf`);
  }

  async exportExcel() {
    const table = $('#myTableOwners').DataTable(); // Inicializa DataTable una vez

    // Cambiar la forma de obtener las filas visibles usando 'search' en lugar de 'filter'
    const visibleRows = table.rows({ search: 'applied' }).data().toArray(); // Usar 'search: applied'

    // Filtrar a los propietarios por aquellos que aparezcan en la tabla visibleRows
    let owners = this.owners.filter((owner) =>
      visibleRows.some(
        (row) => row[1].includes(owner.name) && row[1].includes(owner.lastname)
      )
    );

    // Obtener las fechas 'Desde' y 'Hasta' solo para el nombre del archivo
    const today = this.formatDate(new Date());

    const dataRows = await Promise.all(
      this.owners.map(async (owner) => {
        // Obtener los lotes de manera asíncrona
        const lotes = await this.loadPlots(owner.id);

        // Retornar la fila con la información del propietario
        return {
          Nombre: `${owner.lastname}, ${owner.name}`,
          TipoDocumento: owner.dni_type,
          Documento: owner.dni,
          Tipo: owner.ownerType,
          Lote: lotes, // El string con los lotes
        };
      })
    );

    // Crear la hoja de trabajo con los datos de los propietarios
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataRows, {
      header: ['Nombre', 'TipoDocumento', 'Documento', 'Tipo', 'Lote'],
    });

    // Crear el libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Propietarios');

    const fileName = `${today}_listado_propietarios.xlsx`;

    // Guardar el archivo Excel
    XLSX.writeFile(wb, fileName);
  }
}

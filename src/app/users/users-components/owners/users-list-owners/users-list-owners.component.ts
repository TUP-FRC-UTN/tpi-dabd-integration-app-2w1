import { Component } from '@angular/core';
import { inject } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { OwnerService } from '../../../users-servicies/owner.service';
import { Owner } from '../../../users-models/owner/Owner';
import { UsersModalInfoOwnerComponent } from '../users-modal-info-owner/users-modal-info-owner.component';
import { OwnerTypeModel } from '../../../users-models/owner/OwnerType';
import { FormControl, ReactiveFormsModule} from '@angular/forms';
import { GetPlotDto } from '../../../users-models/plot/GetPlotDto';
import { PlotService } from '../../../users-servicies/plot.service';
import { ModalEliminarOwnerComponent } from '../users-modal-delete-owner/users-modal-delete-owner.component';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import moment from 'moment';

@Component({
  selector: 'app-users-list-owners',
  standalone: true,
  imports: [ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './users-list-owners.component.html',
  styleUrl: './users-list-owners.component.css'
})
export class UsersListOwnersComponent {
  owners: Owner[] = [];
  
  private readonly apiService = inject(OwnerService);
  private readonly plotService = inject(PlotService);
  showDeactivateModal: boolean = false;
  userToDeactivate: number = 0;
  types: any[] = [];
  maxDate: string = new Date().toISOString().split('T')[0];
  minDate: string = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
  selectType: FormControl = new FormControl([]);
  initialDate: FormControl = new FormControl(this.minDate);
  endDate: FormControl = new FormControl(this.maxDate);
  plots : GetPlotDto[] = [];
  ownersWithPlots: any[] = [];

  constructor(private router: Router,private modal: NgbModal) {
    const fecha = new Date();
   }

  async ngOnInit() {
    // Convertir Observable en Promesa y esperar que se resuelva
    this.apiService.getAllWithTheirPlots().subscribe({
      next: (data: Owner[]) => {
        this.ownersWithPlots = data;
      },
    });
  
    this.apiService.getAll().subscribe({
      next: async (data: Owner[]) => {
        // Cambiar guiones por barras en la fecha de nacimiento
        this.owners = data.map((owner) => ({
          ...owner,
          create_date: owner.create_date.replace(/-/g, '/'),
        }));
  
        this.loadTypes();
  
        // Esperar a que todas las promesas de loadPlots se resuelvan
        const plotsData = await Promise.all(
          this.owners.map(async (owner) => [
            owner.create_date,
            `${owner.name}, ${owner.lastname}`,
            `<p class="text-end"> ${ owner.dni }<p/>`,
            //owner.ownerType,
            this.showOwerType(owner.ownerType),
            await this.loadPlots(owner.id), // Espera a que loadPlots se resuelva
            owner.id,
          ])
        );
  
        // Inicializar DataTables después de cargar los datos
        setTimeout(() => {
          const table = $('#myTable').DataTable({
            paging: true,
            searching: true,
            ordering: true,
            lengthChange: true,
            lengthMenu: [5, 10, 25, 50],
            order: [[0, 'asc']],
            pageLength: 5,
            columns: [
              { title: 'Fecha de Creación', width: '15%', className: 'text-start',
                render: (data, type) => {
                  if (type === 'display') {
                    // Mostrar la fecha formateada en la tabla
                    return moment(data, 'DD/MM/YYYY').format('DD/MM/YYYY');
                  } else {
                    // Usar un formato que DataTables pueda ordenar correctamente
                    return moment(data, 'DD/MM/YYYY').toDate();
                  }
                },
               },
              { title: 'Nombre', width: '15%', className: 'text-start' },
              { title: 'Documento', width: '10%', className: 'text-start' },
              { title: 'Tipo', width: '15%', className: 'text-start' },
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
                      <button class="btn btn-light border border-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
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
          const searchInputWrapper = $('#myTable_filter');
          searchInputWrapper.addClass('d-flex justify-content-start');

          table.order([0, 'desc']).draw(); // Ordenar por fecha de creación de forma descendente
  
          // Desvincular el comportamiento predeterminado de búsqueda
          $('#myTable_filter input').unbind();
          $('#myTable_filter input').bind('input', (event) => {
            const searchValue = (event.target as HTMLInputElement).value;
  
            // Comienza a buscar solo si hay 3 o más caracteres
            if (searchValue.length >= 3) {
              table.search(searchValue).draw();
            } else {
              table.search('').draw(); // Limpia la búsqueda si hay menos de 3 caracteres
            }
          });
  
          // Asignar el evento click a los botones "Ver más"
          $('#myTable').on('click', '.view-owner', (event) => {
            const ownerId = $(event.currentTarget).data('id');
            this.abrirModal(ownerId);
          });
  
          // Asignar el evento click a los botones "Editar"
          $('#myTable').on('click', '.edit-owner', (event) => {
            const userId = $(event.currentTarget).data('id');
            this.redirectEdit(userId);
          });

          $('#myTable').on('click', '.delete-owner', (event) => {
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

  async loadPlots(ownerId: number) : Promise<string> {
    
    this.plots = await this.plotService.getAllPlots().toPromise() || [];

    let plots = this.ownersWithPlots.find(owner => owner.owner.id == ownerId);

    let response = ''; 

     for (let i = 0; i < plots.plot.length; i++) {
       console.log(this.plots.find(plot => plot.id == plots.plot[i])?.plot_number );
      
       response += this.plots.find(plot => plot.id == plots.plot[i])?.plot_number + ", " || '';
     }

     response = response.substring(0, response.length - 2);

     console.log(response);
     

    return response;
  }


  async abrirModal(ownerId: number) {
  
    // Espera a que se cargue el usuario seleccionado
    try {
      
      await this.selectOwner(ownerId);
      
      // Una vez cargado, abre el modal
      const modalRef = this.modal.open(UsersModalInfoOwnerComponent, { size: 'lg', keyboard: false });
      modalRef.componentInstance.ownerModel = this.ownerModel;

      modalRef.result.then((result) => {        
        $('#myTable').DataTable().ajax.reload();
      });

    } catch (error) {
      console.error('Error al abrir el modal:', error);
    }
  }

  addOwner(){
    this.router.navigate(['home/owners/add'])
  }

  
  redirectEdit(id: number) {
    this.router.navigate(['/home/owners/edit', id])
  }

  loadTypes() {
    this.apiService.getAllTypes().subscribe({
      next: (data: OwnerTypeModel[]) => {

        this.types = data.map(type => ({value: type.id, name: type.description}));
      },
      error: (error) => {
        console.error('Error al cargar los roles:', error);
        
      }
    });
  }

  async openModalEliminar(userId: number) {
    const modalRef = this.modal.open(ModalEliminarOwnerComponent, { size: 'md', keyboard: false });
    modalRef.componentInstance.userModal = { id: userId};

    // Escuchar el evento de eliminación para recargar los usuarios
    modalRef.componentInstance.userDeleted.subscribe(() => {
      this.cargarTabla(); // Recargar los usuarios después de eliminar
    });
  }

  cargarTabla() {
    // Destruir la instancia de DataTable si ya existe
    if ($.fn.dataTable.isDataTable('#myTable')) {
      $('#myTable').DataTable().clear().destroy();
    }
    this.ngOnInit();
  }

  resetFilters() {
    // Reiniciar el valor del control de rol
    this.selectType.setValue('');
    this.initialDate.setValue(this.minDate);
    this.endDate.setValue(this.maxDate);

    // Limpiar el campo de búsqueda general y el filtro de la columna de tipo
    const searchInput = document.querySelector('#myTable_filter input') as HTMLInputElement;
    if (searchInput) {
        searchInput.value = ''; // Limpiar el valor del input de búsqueda general
    }

    // Obtener la instancia de DataTable
    const table = $('#myTable').DataTable();

    // Limpiar búsqueda y filtros
    table.search('').draw(); // Limpiar búsqueda general
    table.column(3).search('').draw(); // Limpiar filtro de tipo
    table.column(0).search('').draw(); // Limpiar filtro de fecha
}

  updateFilterType() {
    const table = $('#myTable').DataTable();
    
    table.column(3).search(this.selectType.value).draw();
  }


  getContentBetweenArrows(input: string): string[] {
    const matches = [...input.matchAll(/>(.*?)</g)];
    return matches.map(match => match[1]).filter(content => content !== "");
  }

  //Metodo para filtrar la tabla en base a las 2 fechas
  filterByDate() {
    const table = $('#myTable').DataTable();
  
    // Convertir las fechas seleccionadas a objetos Date para comparar
    const start = this.initialDate.value ? new Date(this.initialDate.value) : null;
    const end = this.endDate.value ? new Date(this.endDate.value) : null;
  
    // Agregar función de filtro a DataTable
    $.fn.dataTable.ext.search.push((settings: any, data: any, dataIndex: any) => {
      // Convertir la fecha de la fila (data[0]) a un objeto Date
      const rowDateParts = data[0].split('/'); // Asumiendo que la fecha está en formato DD/MM/YYYY
      const rowDate = new Date(`${rowDateParts[2]}-${rowDateParts[1]}-${rowDateParts[0]}`); // Convertir a formato YYYY-MM-DD
  
      // Realizar las comparaciones
      if (start && rowDate < start) return false;
      if (end && rowDate > end) return false;
      return true;
    });
  
    // Redibujar la tabla después de aplicar el filtro
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
             allowEscapeKey: false
           });
         }
       });
     });
  }

  private formatDate(date: Date): string {
    // Obtener la zona horaria de Argentina (UTC-3)
    const argentinaOffset = 3 * 60;  // Argentina está a UTC-3, por lo que el offset es 3 horas * 60 minutos
  
    // Ajustar la fecha a la zona horaria de Argentina, estableciendo la hora en 00:00
    const localDate = new Date(date.getTime() + (argentinaOffset - date.getTimezoneOffset()) * 60000);
    
    // Establecer la hora en 00:00 para evitar cambios de fecha no deseados
    localDate.setHours(0, 0, 0, 0);
  
    // Sumar un día
    localDate.setDate(localDate.getDate() + 1);
  
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('es-ES', options).format(localDate);
  }


exportPdf() {
  const doc = new jsPDF();

  // Agregar título centrado
  const title = 'Lista de Propietarios';
  doc.setFontSize(18);
  doc.text(title, 15, 20);
  doc.setFontSize(12);

  const formattedDesde = this.formatDate(new Date(this.initialDate.value));
  const formattedHasta = this.formatDate(new Date(this.endDate.value));
  doc.text(`Fechas: Desde ${formattedDesde} hasta ${formattedHasta}`, 15, 30);

  // Definir columnas para el PDF
  const columns = ['Fecha de Creación', 'Nombre', 'Documento', 'Tipo', 'Lotes'];

  // Filtrar datos visibles en la tabla
  const table = $('#myTable').DataTable();

  // Obtener las filas visibles de la tabla
  const visibleRows = table.rows({ search: 'applied' }).data().toArray();

  // Mapear los datos visibles a un formato adecuado para jsPDF
  const rows = visibleRows.map((row: any) => [
      `${row[0]}`,
      `${row[1]}`,
      `${this.getContentBetweenArrows(row[2])}`,
      `${this.getContentBetweenArrows(row[3])}`,
      `${row[4]}`
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
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 50 },
          4: { cellWidth: 30 }
      },
  });

  // Guardar el PDF con el nombre dinámico
  doc.save(`${formattedDesde}_${formattedHasta}_listado_propietarios.pdf`);
}

 async exportExcel() {
  const table = $('#myTable').DataTable(); // Inicializa DataTable una vez

  // Cambiar la forma de obtener las filas visibles usando 'search' en lugar de 'filter'
  const visibleRows = table.rows({ search: 'applied' }).data().toArray(); // Usar 'search: applied'

  // Filtrar a los propietarios por aquellos que aparezcan en la tabla visibleRows
  let owners = this.owners.filter(owner => visibleRows.some(row => row[1].includes(owner.name) && row[1].includes(owner.lastname)));

  // Obtener las fechas 'Desde' y 'Hasta' solo para el nombre del archivo
  const formattedDesde = this.formatDate(new Date(this.initialDate.value));
  const formattedHasta = this.formatDate(new Date(this.endDate.value));

  const dataRows = await Promise.all(this.owners.map(async (owner) => {
    // Obtener los lotes de manera asíncrona
    const lotes = await this.loadPlots(owner.id);

    // Retornar la fila con la información del propietario
    return {
      FechaCreacion: owner.create_date.replace(/-/g, '/'),
      Nombre: `${owner.lastname}, ${owner.name}`,
      Documento: owner.dni,
      Tipo: owner.ownerType,
      Lote: lotes  // El string con los lotes
    };
  }));

  // Crear la hoja de trabajo con los datos de los propietarios
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataRows, { header: ['FechaCreacion', 'Nombre', 'Documento', 'Tipo', 'Lote'] });

  // Crear el libro de trabajo
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Propietarios');

  // Obtener la fecha actual para el nombre del archivo
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '_');
  const fileName = `${formattedDesde}_${formattedHasta}_listado_propietarios.xlsx`;

  // Guardar el archivo Excel
  XLSX.writeFile(wb, fileName);
}
  
}

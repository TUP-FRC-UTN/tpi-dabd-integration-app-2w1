import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserGet } from '../../../users-models/users/UserGet';
import { PlotService } from '../../../users-servicies/plot.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalInfoUserComponent } from '../users-modal-info-user/modal-info-user.component';
import { UserService } from '../../../users-servicies/user.service';
import jsPDF from 'jspdf';
import autoTable, { Row } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import { GetPlotDto } from '../../../users-models/plot/GetPlotDto';
import 'datatables.net';
import 'datatables.net-bs5';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { RolModel } from '../../../users-models/users/Rol';
import { GetPlotModel } from '../../../users-models/plot/GetPlot';
import { ModalEliminarUserComponent } from '../users-modal-eliminar-user/modal-eliminar-user/modal-eliminar-user.component';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import moment from 'moment';
import { RoutingService } from '../../../../common/services/routing.service';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';

@Component({
  selector: 'app-list-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.css']
})
export class ListUsersComponent implements OnInit, OnDestroy {

  selectedOptions: any;
  optionesFilter: any;

  private readonly routingService = inject(RoutingService);
  private readonly suscriptionService = inject(SuscriptionManagerService);

  constructor(private modal: NgbModal, private plotService: PlotService) { }

  @ViewChild('customSelect') customSelect!: CustomSelectComponent;

  typeModal: string = '';
  user: number = 0;
  users: UserGet[] = [];
  roles: RolModel[] = [];
  private readonly apiService = inject(UserService);
  showDeactivateModal: boolean = false;
  userToDeactivate: number = 0;
  maxDate: string = new Date().toISOString().split('T')[0];
  minDate: string = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
  plots: GetPlotDto[] = [];
  selectRol: FormControl = new FormControl('');
  rolesFilter: any[] = [];
  selectedRole: string = '';
  initialDate: FormControl = new FormControl(this.minDate);
  endDate: FormControl = new FormControl(this.maxDate);
  placeholder: string = "Seleccione un rol";
  estadoRoles: { [id: string]: boolean } = {};
  userModal: UserGet = new UserGet();

  ngOnInit() {
    this.loadRoles();
    this.loadAllPlots();
    //Trae todos los usuarios
    const sus = this.apiService.getAllUsers().subscribe({
      next: (data: UserGet[]) => {
        //Cambiar guiones por barras en la fecha de nacimiento
        this.users = data.map(user => ({
          ...user,

          datebirth: user.datebirth.replace(/-/g, '/'),
          create_date: user.create_date.replace(/-/g, '/'),


        }));

        //Inicializar DataTables después de cargar los datos
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
              {
                title: 'Fecha de Creación',
                className: 'text-start',
                width: '20%',
                render: (data, type, row, meta) => {
                  if (type === 'display') {
                    // Mostrar la fecha formateada en la tabla
                    return moment(data, 'DD/MM/YYYY').format('DD/MM/YYYY');
                  } else {
                    // Usar un formato que DataTables pueda ordenar correctamente
                    return moment(data, 'DD/MM/YYYY').toDate();
                  }
                }
              }
              ,

              { title: 'Nombre', width: '20%' },
              { title: 'Rol', width: '30%' },
              {
                title: 'Lotes', className: 'text-start', width: '15%',
                render: (data) => {

                  let plotNumber: GetPlotDto[] = [];

                  data.forEach((d: any) => {
                    const plot = this.plots.find((plot: GetPlotDto) => plot.id == d);
                    if (plot) {
                      plotNumber.push(plot);
                    }
                  });

                  if (plotNumber != undefined) {

                    if (plotNumber.length > 0) {
                      var plots: string = "";
                      for (let i = 0; i < plotNumber.length; i++) {
                        plots = plots + plotNumber[i].plot_number + ", ";
                        // borrar la ultima letra del plots
                      }
                      plots = plots.substring(0, plots.length - 2);
                      return plots;
                    } else {
                      return "Sin lote";
                    }
                  }
                  return "Sin lote";


                }
              },
              {
                title: 'Acciones',
                orderable: false,
                width: '15%',
                className: 'text-center',
                render: (data, type, row, meta) => {
                  const userId = this.users[meta.row].id;
                  return `
                    <div class="dropdown-center d-flex text-center justify-content-center">
                      <button class="btn btn-light border border-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul class="dropdown-menu">
                        <li><a class="dropdown-item view-user hover" data-id="${meta.row}">Ver más</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item edit-user" data-id="${userId}">Editar</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item delete-user" data-id="${meta.row}">Eliminar</a></li>
                      </ul>
                    </div>
                  `;
                }
              }
            ],
            dom:
              '<"mb-3"t>' +
              '<"d-flex justify-content-between"lp>',
            data: this.users.map(user => [
              user.create_date,
              `${user.lastname}, ${user.name}`,  //Nombre completo
              this.showRole(user.roles),              //Roles
              user.plot_id,                                //Nro. de lote (puedes ajustar esto)                 
              '<button class="btn btn-info">Ver más</button>'  //Ejemplo de acción
            ]),
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

          table.order([[0, 'desc']]).draw();

          //Alinear la caja de búsqueda a la derecha
          const searchInputWrapper = $('#myTable_filter');
          searchInputWrapper.addClass('d-flex justify-content-start');

          //Desvincular el comportamiento predeterminado de búsqueda
          $('#myTable_filter input').unbind();
          $('#myTable_filter input').bind('input', (event) => { //Usar función de flecha aquí
            const searchValue = (event.target as HTMLInputElement).value; //Acceder al valor correctamente

            //Comienza a buscar solo si hay 3 o más caracteres
            if (searchValue.length >= 3) {
              table.search(searchValue).draw();
            } else {
              table.search('').draw(); //Limpia la búsqueda si hay menos de 3 caracteres
            }
          });

          //Asignar el evento click a los botones "Ver más"
          //Asignar el evento click a los botones "Ver más"
          $('#myTable').on('click', '.view-user', (event) => {
            const id = $(event.currentTarget).data('id');
            const userId = this.users[id].id; //Obtén el ID real del usuario
            this.openModal("info", userId); //Pasa el ID del usuario al abrir el modal
          });


          $('#myTable').on('click', '.delete-user', (event) => {
            const id = $(event.currentTarget).data('id');
            const userId = this.users[id].id; //Obtén el ID real del usuario
            this.openModalEliminar(userId); //Pasa el ID del usuario al abrir el modal 
          });

          //Asignar el evento click a los botones "Editar"
          $('#myTable').on('click', '.edit-user', (event) => {
            const userId = $(event.currentTarget).data('id');
            this.redirectEdit(userId); //Redirigir al método de edición
          });


        }, 0); //Asegurar que la tabla se inicializa en el próximo ciclo del evento
      },
      error: (error) => {
        console.error('Error al cargar los usuarios:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al cargar los usuarios. Por favor, inténtalo más tarde.',
          showConfirmButton: true,
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          allowEscapeKey: false
        })
        this.routingService.redirect('/main', 'Página principal');
      }
    });

    //Agregar suscripción
    this.suscriptionService.addSuscription(sus);
  }

  //Desuscribirse de todos los observables
  ngOnDestroy(): void {
    this.suscriptionService.unsubscribeAll();
  }

  //-------------------------------------------------Carga de datos-------------------------------------------
  //Cargar todos los lotes
  loadAllPlots() {
    this.plotService.getAllPlots().subscribe({
      next: (data: GetPlotDto[]) => {
        this.plots = data;
      },
      error: (error) => {
        console.error('Error al cargar los lotes:', error);
      }
    })
  }

  //Cargar roles
  loadRoles() {
    const sus = this.apiService.getAllRoles().subscribe({
      next: (data: RolModel[]) => {

        this.roles = data;
        this.rolesFilter = data.map(r => ({
          value: r.description,
          name: r.description
        }));
      },
      error: (error) => {
        console.error('Error al cargar los roles:', error);

      }
    });

    //Agregar suscripción
    this.suscriptionService.addSuscription(sus);
  }

  //Obtener lotes por id
  getPlotByUser(plotId: number) {
    const sus = this.plotService.getPlotById(plotId).subscribe({
      next: (data: GetPlotModel) => {
        return data.plot_number;
      }
    })

    //Agregar suscripción
    this.suscriptionService.addSuscription(sus);
  }

  //-----------------------------------------------------Modal-------------------------------------------------------

  //Abrir modal eliminar usuario
  async openModalEliminar(userId: number) {
    // Obtener el usuario completo usando el UserService
    this.apiService.getUserById(userId).subscribe(user => {
      // Verifica si el usuario tiene el rol "Propietario"
      if (user.roles.includes('Propietario')) {
        Swal.fire({
          icon: 'warning',
          title: 'Acción no permitida',
          text: 'No se puede eliminar a un propietario desde esta lista. Por favor, elimínelo desde la lista de propietarios.',
          confirmButtonText: 'OK',
        });
        return; // Salir de la función sin abrir el modal
      }

      // Abrir el modal si el usuario no es "Propietario"
      const modalRef = this.modal.open(ModalEliminarUserComponent, { size: 'md', keyboard: false });
      modalRef.componentInstance.userModal = { id: userId };

      // Escuchar el evento de eliminación para recargar los usuarios
      modalRef.componentInstance.userDeleted.subscribe(() => {
        this.cargarTabla(); // Recargar los usuarios después de eliminar
      });
    });
  }



  //Método para abrir el modal
  async openModal(type: string, userId: number) {
    //Espera a que se cargue el usuario seleccionado
    try {
      await this.selectUser(userId);

      let user: any = this.userModal.plot_id;
      let userPlots: any = [];
      user.forEach((plot: any) => {
        console.log("AA" + plot);

        const userPlot = this.plots.find((p: any) => p.id == plot);
        console.log(userPlot);

        if (userPlot) {
          userPlots.push(userPlot);
        }
      });

      //Cuando se carga se abre el modal
      const modalRef = this.modal.open(ModalInfoUserComponent, { size: 'lg', keyboard: false });
      modalRef.componentInstance.typeModal = type;
      modalRef.componentInstance.userModal = this.userModal;
      modalRef.componentInstance.plotModal = userPlots;

      modalRef.result.then((result) => {
      });

    } catch (error) {
      console.error('Error al abrir el modal:', error);
    }
  }

  //Cambia el tipo de modal
  changeTypeModal(type: string) {
    this.typeModal = type;
  }

  //Busca el user y se lo pasa al modal
  selectUser(id: number): Promise<UserGet> {
    return new Promise((resolve, reject) => {
      this.user = id;
      const sus = this.apiService.getUserById(id).subscribe({
        next: (data: UserGet) => {
          this.userModal = data;
          Swal.close(); //Cerrar SweetAlert
          resolve(data); //Resuelve la promesa cuando los datos se cargan
        },
        error: (error) => {
          console.error('Error al cargar el usuario:', error);
          reject(error); //Rechaza la promesa si ocurre un error
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al cargar el usuario. Por favor, inténtalo de nuevo.',
            confirmButtonText: 'Aceptar'

          });
        }
      });

      //Agregar suscripción
      this.suscriptionService.addSuscription(sus);
    });
  }

  //----------------------------------------------------Filtros-----------------------------------------------------

  //Carga la tabla
  cargarTabla() {
    // Destruir la instancia de DataTable si ya existe
    if ($.fn.dataTable.isDataTable('#myTable')) {
      $('#myTable').DataTable().clear().destroy();
    }
    this.ngOnInit();
  }

  //Resetear filtros
  resetFilters() {
    // Reiniciar los valores de rol y fechas
    this.selectRol.setValue('');
    this.initialDate.setValue(this.minDate);
    this.endDate.setValue(this.maxDate);

    // Limpiar el campo de búsqueda general
    const searchInput = document.getElementById("myTable_search") as HTMLInputElement;
    if (searchInput) {
      searchInput.value = ''; // Limpiar el valor del input
    }

    // Eliminar todos los filtros personalizados
    $.fn.dataTable.ext.search.splice(0, $.fn.dataTable.ext.search.length);

    // Obtener la instancia de DataTable
    const table = $('#myTable').DataTable();

    // Reiniciar roles y custom select
    this.rolesFilter = this.roles.map(r => ({
      value: r.description,
      name: r.description,
    }));

    if (this.customSelect) {
      this.customSelect.setData([]); // Reiniciar datos del custom select
    }

    // Limpiar filtros de columnas y búsqueda general
    table.column(2).search(''); // Limpiar columna específica
    table.search(''); // Limpiar búsqueda general

    // Redibujar la tabla
    table.draw();
  }

  //Filtrar por rol
  fillOptionsSelected(options: any) {
    var optionsFilter = options.map((option: any) => option).join('|'); // Usar '|' para permitir múltiples filtros
    const table = $('#myTable').DataTable();

    // Filtrar por el contenido de la columna de tipo de lote, teniendo en cuenta que puede tener unicamente 1 valor, pero se tiene que filtrar x varios
    table.column(2).search(optionsFilter, true, false).draw(); 
  }

  //Metodo para filtrar la tabla en base a las 2 fechas
  filterByDate() {
    const table = $('#myTable').DataTable();

    // Convertir las fechas seleccionadas a objetos Date para comparar
    const start = this.initialDate.value ? (new Date(this.initialDate.value)).toISOString().split('T')[0] : null;
    const end = this.endDate.value ? (new Date(this.endDate.value)).toISOString().split('T')[0] : null;

    // Limpiar cualquier filtro previo relacionado con fechas
    $.fn.dataTable.ext.search.splice(0, $.fn.dataTable.ext.search.length);

    // Agregar una nueva función de filtro
    $.fn.dataTable.ext.search.push((settings: any, data: any, dataIndex: any) => {
      // Convertir la fecha de la fila (data[0]) a un objeto Date
      const rowDateParts = data[0].split('/'); // Asumiendo que la fecha está en formato DD/MM/YYYY
      const rowDate = (new Date(`${rowDateParts[2]}-${rowDateParts[1]}-${rowDateParts[0]}`)).toISOString().split('T')[0]; // Convertir a formato YYYY-MM-DD



      // Realizar las comparaciones
      if (start && rowDate < start) return false;
      if (end && rowDate > end) return false;
      return true;
    });

    // Redibujar la tabla con el filtro aplicado
    table.draw();
  }

  //----------------------------------------------------Funciones----------------------------------------------------

  //Formatea la fecha
  private formatDate(date: Date): string {
    //Obtener la zona horaria de Argentina (UTC-3)
    //Argentina está a UTC-3, por lo que el offset es 3 horas * 60 minutos
    const argentinaOffset = 3 * 60;

    //Ajustar la fecha a la zona horaria de Argentina, estableciendo la hora en 00:00
    const localDate = new Date(date.getTime() + (argentinaOffset - date.getTimezoneOffset()) * 60000);

    //Establecer la hora en 00:00 para evitar cambios de fecha no deseados
    localDate.setHours(0, 0, 0, 0);

    //Sumar un día
    localDate.setDate(localDate.getDate() + 1);

    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('es-ES', options).format(localDate);
  }

  //Filtrar lote por id
  getPlotById(plotId: number): number {
    const plot = this.plots.find(plot => plot.id === plotId);
    return plot?.plot_number || 0;
  }

  //---------------------------------------------------Redirecciones--------------------------------------------------

  //Redirigir a agregar usuario
  addUser() {
    this.routingService.redirect('/main/users/add', 'Agregar usuario');
  }

  //Redirige a la edición de un usuario
  redirectEdit(id: number) {
    this.routingService.redirect(`/main/users/edit/${id}`, 'Modificar usuario');
  }

  //--------------------------------------------------Estilos----------------------------------------------------

  //Obtener el contenido entre <>
  getContentBetweenArrows(input: string): string[] {
    const matches = [...input.matchAll(/>([^+<,]*)</g)];
    return matches.map(match => match[1].trim()).filter(content => content !== "");
  }

  //Mostrar roles con badges
  showRole(roles: string[]): string {
    let rolesA: string = "";


    let max: number = 2;

    if (roles.length > 1) {
      for (let i = 0; i < max; i++) {
        let color: string = "";
        switch (roles[i]) {
          case "Gerente general":
            color = "text-bg-salmon";
            break;
          case "Propietario":
            color = "text-bg-primary";
            break;
          case "Familiar mayor":
            color = "bg-secondary";
            break;
          case "Familiar menor":
            color = "text-bg-menor";
            break;
          case "SuperAdmin":
            color = "text-bg-dark";
            break;
          case "Inquilino":
            color = "text-bg-cyan";
            break;
          case "Gerente finanzas":
            color = "text-bg-pink";
            break;
          case "Contador":
            color = "text-bg-teal text-dark";
            break;
          case "Seguridad":
            color = "text-bg-orange";
            break;
          case "Gerente inventario":
            color = "text-bg-blue";
            break;
          case "Gerente empleados":
            color = "text-bg-red";
            break;
          case "Gerente multas":
            color = "text-bg-indigo";
            break;
          default:
            color = "badge bg-info text-dark";
            break;
        }

        rolesA += `
                     <span class="badge rounded-pill ${color}">${roles[i]}</span> `;
      }
    } else {
      let color: string = "";
      switch (roles[0]) {
        case "Gerente general":
            color = "text-bg-salmon";
            break;
          case "Propietario":
            color = "text-bg-primary";
            break;
          case "Familiar mayor":
            color = "bg-secondary";
            break;
          case "Familiar menor":
            color = "text-bg-menor";
            break;
          case "SuperAdmin":
            color = "text-bg-dark";
            break;
          case "Inquilino":
            color = "text-bg-cyan";
            break;
          case "Gerente finanzas":
            color = "text-bg-pink";
            break;
          case "Contador":
            color = "text-bg-teal text-dark";
            break;
          case "Seguridad":
            color = "text-bg-orange";
            break;
          case "Gerente inventario":
            color = "text-bg-blue";
            break;
          case "Gerente empleados":
            color = "text-bg-red";
            break;
          case "Gerente multas":
            color = "text-bg-indigo";
            break;
          default:
            color = "badge bg-info text-dark";
            break;
      }

      rolesA += `
                     <span class="badge rounded-pill ${color}">${roles[0]}</span> `;
    }


    if (roles.length > 2) {
      var rolesExtra = roles.slice(2);
      var rolesB = "";

      rolesExtra.forEach((role: string) => {
        let color: string = "";
        switch (role) {
          case "Gerente general":
            color = "text-bg-salmon";
            break;
          case "Propietario":
            color = "text-bg-primary";
            break;
          case "Familiar mayor":
            color = "bg-secondary";
            break;
          case "Familiar menor":
            color = "text-bg-menor";
            break;
          case "SuperAdmin":
            color = "text-bg-dark";
            break;
          case "Inquilino":
            color = "text-bg-cyan";
            break;
          case "Gerente finanzas":
            color = "text-bg-pink";
            break;
          case "Contador":
            color = "text-bg-teal text-dark";
            break;
          case "Seguridad":
            color = "text-bg-orange";
            break;
          case "Gerente inventario":
            color = "text-bg-blue";
            break;
          case "Gerente empleados":
            color = "text-bg-red";
            break;
          case "Gerente multas":
            color = "text-bg-indigo";
            break;
          default:
            color = "badge bg-info text-dark";
            break;
        }

        rolesB += `<span class="badge rounded-pill m-1 ${color}">${role}</span> `;
      });

      rolesA += `<button class="btn btn-outline-dark text-dark badge" data-bs-toggle="collapse"
           data-bs-target="#extraRoles" aria-expanded="false" aria-controls="extraRoles">
              +
            </button>

            <div class="collapse position-absolute" id="extraRoles">
              <div class="card card-body d-flex" style="z-index: 10;">
                ${rolesB}
              </div>
            </div>`;
    }

    return rolesA;
  }

  //------------------------------------------------Exportar------------------------------------------------

  //Exportar a PDF
  exportPdf() {
    const doc = new jsPDF();

    const title = 'Lista de Usuarios';
    doc.setFontSize(18);
    doc.text(title, 15, 20);
    doc.setFontSize(12);

    const formattedDesde = this.formatDate(new Date(this.initialDate.value));
    const formattedHasta = this.formatDate(new Date(this.endDate.value));
    doc.text(`Fechas: Desde ${formattedDesde} hasta ${formattedHasta}`, 15, 30);

    const columns = ['Fecha de creación', 'Nombre', 'Rol', 'Lotes'];

    const table = $('#myTable').DataTable();

    const visibleRows = table.rows({ search: 'applied' }).data().toArray();

    const rows = visibleRows.map((row: any) => [
      row[0], // Fecha de creación
      `${row[1]}`,               // Nombre
      `${this.getContentBetweenArrows(row[2])}`, // Rol
      `${row[3]}` // Lote
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 35,
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
        3: { cellWidth: 30 }
      },
    });
    doc.save(`${formattedDesde}_${formattedHasta}_listado_usuarios.pdf`);
  }

  //Exportar a Excel
  exportExcel() {
    const table = $('#myTable').DataTable(); // Inicializa DataTable una vez

    // Obtener las filas visibles usando 'search: applied' (como en el export PDF)
    const visibleRows = table.rows({ search: 'applied' }).data().toArray();

    // Obtener las fechas 'Desde' y 'Hasta' solo para el nombre del archivo
    const formattedDesde = this.formatDate(new Date(this.initialDate.value));
    const formattedHasta = this.formatDate(new Date(this.endDate.value));

    // Mapeamos las filas visibles a un formato adecuado para los datos de Excel
    const dataRows = visibleRows.map((row: any) => {
      // Extraemos los datos de la fila
      const fechaCreacion = row[0]; // Fecha de creación
      const nombre = row[1]; // Nombre
      const rol = Array.isArray(row[2])
        ? row[2].map((r: string) => this.getContentBetweenArrows(r).join(', ')).join(', ')
        : this.getContentBetweenArrows(row[2]).join(', '); // Aplicamos getContentBetweenArrows si es un array o un string
      const lote = Array.isArray(row[3]) ? row[3].join(', ') : row[3]; // Si lote es un array, lo unimos por comas

      // Creamos el objeto para cada fila
      return {
        'Fecha de Creación': fechaCreacion,
        'Nombre': nombre,
        'Rol': rol,  // Aplicado getContentBetweenArrows a 'rol'
        'Lote': lote // Convertido a string
      };
    });

    // Crear la hoja de trabajo con los datos de los usuarios
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataRows, { header: ['Fecha de Creación', 'Nombre', 'Rol', 'Lote'] });

    // Crear el libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');

    // Guardar el archivo Excel con las fechas de los filtros
    const fileName = `${formattedDesde}_${formattedHasta}_listado_usuarios.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
}


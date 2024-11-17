import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { UserGet } from '../../../users-models/users/UserGet';
import { CommonModule, getLocaleMonthNames } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../users-servicies/user.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { PlotModel } from '../../../users-models/plot/Plot';
import { PlotService } from '../../../users-servicies/plot.service';
import { GetPlotModel } from '../../../users-models/plot/GetPlot';
import { UsersModaInfoPlotComponent } from '../users-moda-info-plot/users-moda-info-plot.component';
import { PlotStateModel } from '../../../users-models/plot/PlotState';
import { PlotTypeModel } from '../../../users-models/plot/PlotType';
import { OwnerService } from '../../../users-servicies/owner.service';
import { map } from 'rxjs/operators';
import { Owner } from '../../../users-models/owner/Owner';
import { LoginComponent } from '../../../../common/components/users-login/login.component';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component'; 

@Component({
  selector: 'app-users-list-plots',
  standalone: true,
  imports: [ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './users-list-plots.component.html',
  styleUrl: './users-list-plots.component.css'
})
export class UsersListPlotsComponent {
  plots: GetPlotModel[] = [];
  private readonly plotService = inject(PlotService);
  private readonly ownerService = inject(OwnerService);
  showDeactivateModal: boolean = false;
  userToDeactivate: number = 0;

  //Filtros
  selectType = new FormControl();
  selectState = new FormControl();


  plotTypes: string[] = [];
  plotStatus: string[] = [];
  typesForFilter: any[] = [];
  statusForFilter: any[] = [];


  constructor(private router: Router, private modal: NgbModal) { }

  async ngOnInit() {
    this.plotService.getAllStates().subscribe({
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

    this.plotService.getAllTypes().subscribe({
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

    this.plotService.getAllPlots().subscribe({
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
          const table = $('#myTable').DataTable({
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
              { title: 'Lote', width: '10%', className: 'text-center' },
              { title: 'Manzana', width: '10%', className: 'text-start' },
              { title: 'Mts.2 Terreno', width: '15%', className: 'text-start' },
              { title: 'Mts.2 Construidos', width: '15%', className: 'text-start' },
              { title: 'Tipo Lote', width: '15%', className: 'text-start' },
              { title: 'Estado', width: '15%', className: 'text-start' },
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
                      <button class="btn btn-light border border-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul class="dropdown-menu">
                        <li><a class="dropdown-item view-plot" data-id="${plotId}">Ver más</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item edit-plot" data-id="${plotId}">Editar</a></li>
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
          const searchInputWrapper = $('#myTable_filter');
          searchInputWrapper.addClass('d-flex justify-content-start');

          // Desvincular el comportamiento predeterminado de búsqueda
          $('#myTable_filter input').unbind();
          $('#myTable_filter input').bind('input', (event) => {
            const searchValue = (event.target as HTMLInputElement).value;
            if (searchValue.length >= 2) {
              table.search(searchValue).draw();
            } else {
              table.search('').draw();
            }
          });

          // Asignar eventos a los botones "Ver más" y "Editar"
          $('#myTable').on('click', '.view-plot', (event) => {
            const plotId = $(event.currentTarget).data('id');
            this.abrirModal(plotId);
          });

          $('#myTable').on('click', '.edit-plot', (event) => {
            const plotId = $(event.currentTarget).data('id');
            this.redirectEdit(plotId);
          });

        }, 0);
      },
      error: (error) => {
        console.error('Error al cargar los lotes:', error);
      }
    });

    this.selectType.setValue('');
    this.selectState.setValue('');
  }

  async showOwner(plotId: number): Promise<string> {
    return new Promise<string>((resolve) => {
      this.ownerService.getOwnerByPlotId(plotId).subscribe({
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
    });
  }


  //Filtrat por tipo
  updateFilterType(options: any[]) {
   // Asignamos directamente los roles emitidos
    var optionsFilter = options.map((option: any) => option).join(' ');
    console.log(optionsFilter);
    
    const table = $('#myTable').DataTable();
    
    table.column(4).search(optionsFilter ?? '').draw();
  }

  //Filtrat por tipo
  updateFilterTypeSimple() {
    const table = $('#myTable').DataTable();
    table.column(4).search(this.selectType.value ?? '').draw();
  }

  //Filtrar por estado
  updateFilterStateSimple() {
    const table = $('#myTable').DataTable();
    table.column(5).search(this.selectState.value ?? '').draw();
  }
 

  //Filtrar por estado
  updateFilterState(options: any[]) {
    var optionsFilter = options.map((option: any) => option).join(' ');
    console.log(optionsFilter);
    
    const table = $('#myTable').DataTable();
    
    table.column(5).search(optionsFilter ?? '').draw();
  }

  getContentBetweenArrows(input: string): string[] {
    const matches = [...input.matchAll(/>(.*?)</g)];
    const cleanedResults = matches
      .map(match => match[1].trim()) // Elimina los espacios al inicio y al final de cada elemento
      .filter(content => content !== ""); // Filtra los elementos que solo sean espacios o estén vacíos
    
    console.log(cleanedResults); // Verifica el resultado con los logs
  
    return cleanedResults;
  }
  

  resetFilters() {
    // Reiniciar el valor del control de rol
    this.selectType.setValue('');
    this.selectState.setValue('');

    // Limpiar el campo de búsqueda general y el filtro de la columna de tipo
    const searchInput = document.querySelector('#myTable_filter input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = ''; // Limpiar el valor del input de búsqueda general
    }

    // Obtener la instancia de DataTable
    const table = $('#myTable').DataTable();

    // Limpiar búsqueda y filtros
    table.search('').draw(); // Limpiar búsqueda general
    table.column(4).search('').draw(); // Limpiar filtro de tipo
    table.column(5).search('').draw(); // Limpiar filtro de tipo
  }


  //Exporta a pdf la tabla, si esta filtrada solo exporta los datos filtrados
  exportPdf() {
    // Mantener la orientación del documento en portrait
    const doc = new jsPDF('portrait');

    // Agregar título centrado con la fecha actual a la derecha
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

    // Configuración del título
    const titleText = `${title}`;

    // Definir las columnas de la tabla
    const columns = ['Lote', 'Manzana', 'M2 Totales', 'M2 Construidos', 'Tipo', 'Estado', 'Propietario'];

    // Obtener los datos filtrados en la tabla HTML
    const table = $('#myTable').DataTable();
    const visibleRows = table.rows({ search: 'applied' }).data().toArray();

    // Mapear los datos visibles para el PDF
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

  exportExcel() {
    // Obtenemos los datos visibles de la tabla (basados en los filtros aplicados)
    const table = $('#myTable').DataTable();
    const visibleRows = table.rows({ search: 'applied' }).data().toArray();

    const today = new Date();
    const formattedDate = 
    today.getDate().toString().padStart(2, '0') + '/' + 
    (today.getMonth() + 1).toString().padStart(2, '0') + '/' + 
    today.getFullYear();
  
    // Preparamos los datos en formato adecuado para Excel
    const rows = visibleRows.map((row: any) => [
      `${this.getContentBetweenArrows(row[0])}`,
      `${this.getContentBetweenArrows(row[1])}`,
      `${this.getContentBetweenArrows(row[2])}`,
      `${this.getContentBetweenArrows(row[3])}`,
      `${this.getContentBetweenArrows(row[4])}`,
      `${this.getContentBetweenArrows(row[5])}`,
      `${row[6]}`  // Propietario
    ]);
  
    // Definimos las columnas para el archivo Excel
    const header = ['Lote', 'Manzana', 'M2 Totales', 'M2 Construidos', 'Tipo', 'Estado', 'Propietario'];
  
    // Creamos la hoja de Excel
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
  
    // Creamos un libro de trabajo con la hoja
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lista de Lotes');
  
    // Exportamos el archivo Excel
    const fileName = `${formattedDate}_listado_lotes.xlsx`;
    XLSX.writeFile(wb, fileName);
  }



  async abrirModal(plotId: number) {
    console.log("Esperando a que userModal se cargue...");

    // Espera a que se cargue el usuario seleccionado
    try {
      console.log("Cargando lote...");

      await this.selectUser(plotId);
      console.log("lote cargado:", this.plotModel);
      console.log("Abriendo modal...");


      // Una vez cargado, abre el modal
      const modalRef = this.modal.open(UsersModaInfoPlotComponent, { size: 'lg', keyboard: false });
      modalRef.componentInstance.plotModel = this.plotModel;

      modalRef.result.then((result) => {
        $('#myTable').DataTable().ajax.reload();
      });

    } catch (error) {
      console.error('Error al abrir el modal:', error);
    }
  }

  addPlot() {
    this.router.navigate(['/home/plots/add'])
  }

  redirectEdit(id: number) {
    this.router.navigate(['/home/plots/edit', id])
  }

  // Busca el user y se lo pasa al modal
  plotModel: GetPlotModel = new GetPlotModel();
  selectUser(id: number): Promise<GetPlotModel> {
    // Mostrar SweetAlert de tipo 'cargando'
    return new Promise((resolve, reject) => {
      this.plotService.getPlotById(id).subscribe({
        next: (data: GetPlotModel) => {
          this.plotModel = data;
          Swal.close(); // Cerrar SweetAlert
          resolve(data); // Resuelve la promesa cuando los datos se cargan
        },
        error: (error) => {
          console.error('Error al cargar el lote:', error);
          reject(error); // Rechaza la promesa si ocurre un error
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
}

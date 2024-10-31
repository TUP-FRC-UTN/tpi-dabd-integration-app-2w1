import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { UserGet } from '../../../users-models/users/UserGet';
import { CommonModule, getLocaleMonthNames } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-users-list-plots',
  standalone: true,
  imports: [],
  templateUrl: './users-list-plots.component.html',
  styleUrl: './users-list-plots.component.css'
})
export class UsersListPlotsComponent {
  plots: GetPlotModel[] = [];
  private readonly apiService = inject(PlotService);
  showDeactivateModal: boolean = false;
  userToDeactivate: number = 0;

  constructor(private router: Router,private modal: NgbModal) { }

  ngOnInit() {
    this.apiService.getAllPlots().subscribe({
      next: (data: GetPlotModel[]) => {
        // Cambiar guiones por barras en la fecha de nacimiento
        this.plots = data;         
        
        // Inicializar DataTables después de cargar los datos
        setTimeout(() => {
          const table = $('#myTable').DataTable({
            paging: true,
            searching: true,
            ordering: true,
            lengthChange: true,
            lengthMenu: [10, 25, 50],
            order: [[0, 'asc']],
            pageLength: 10,
            columns: [
              { title: 'Lote', width: '10%', className: 'text-start' },
              { title: 'Manzana', width: '10%', className: 'text-start'},
              { title: 'Mts.2 Terreno', width: '15%', className: 'text-start' },
              { title: 'Mts.2 Construidos', width: '15%', className: 'text-start' },
              { title: 'Tipo Lote', width: '15%', className: 'text-start' },
              { title: 'Estado', width: '15%', className: 'text-start' },
              {
                title: 'Acciones',
                orderable: false,
                width: '15%',
                className: 'text-left',  
                render: (data, type, row, meta) => {
                  const plotId = this.plots[meta.row].id;
                  return `
                    <div class="dropdown-center d-flex align-items-center">
                      <button class="btn btn-light border border-1 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul class="dropdown-menu">
                        <li><a class="dropdown-item view-plot" data-id="${plotId}">Ver más</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item edit-plot" data-id="${plotId}">Editar</a></li>
                      </ul>
                    </div>
                  `; // si queremos el ver mas de nuevo <li><a class="dropdown-item view-plot" data-id="${meta.row}">Ver más</a></li>
                }
              }
            ],
            data: this.plots.map(plot => [
               // Ejemplo de acción
              plot.plot_number,
              plot.block_number,
              plot.total_area_in_m2,
              plot.built_area_in_m2,  
              plot.plot_type,
              plot.plot_state
            ]),
            dom:
            '<"mb-3"t>' +                           
            '<"d-flex justify-content-between"lp>',
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
          $('#myTable_filter input').bind('input', (event) => { // Usar función de flecha aquí
              const searchValue = (event.target as HTMLInputElement).value; // Acceder al valor correctamente
          
              // Comienza a buscar solo si hay 3 o más caracteres
              if (searchValue.length >= 2) {
                  table.search(searchValue).draw();
              } else {
                  table.search('').draw(); // Limpia la búsqueda si hay menos de 3 caracteres
              }
          });

          // Asignar el evento click a los botones "Ver más"
          // Asignar el evento click a los botones "Ver más"
        $('#myTable').on('click', '.view-plot', (event) => {
          
          //Comente estas lineas porque daba error
          //const id = $(event.currentTarget).data('id');
          //const userId = this.plots[id].id; // Obtén el ID real del usuario
          const plotId = $(event.currentTarget).data('id');
          this.abrirModal( plotId); // Abre el modal en modo "ver"
        });

          // Asignar el evento click a los botones "Editar"
          $('#myTable').on('click', '.edit-plot', (event) => {
            console.log("a");
            
            const userId = $(event.currentTarget).data('id');
            this.redirectEdit(userId); // Redirigir al método de edición
          });


        }, 0); // Asegurar que la tabla se inicializa en el próximo ciclo del evento
      },
      error: (error) => {
        console.error('Error al cargar los lotes:', error);
      }
    });
  }

   //Exporta a pdf la tabla, si esta filtrada solo exporta los datos filtrados
   exportPdf() {
    const doc = new jsPDF();
  
    // Agregar título centrado
    const title = 'Lista de Lotes';
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(16);
    const textWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - textWidth) / 2, 20);
  
    // Obtener columnas de la tabla (añadido 'Email')
    const columns = ['Lote', 'Manzana', 'M2', 'M2 Construidos','Tipo','Estado'];
  
    // Filtrar datos visibles en la tabla
    const table = $('#myTable').DataTable(); // Inicializa DataTable una vez
  
    // Cambia la forma de obtener las filas visibles usando 'search' en lugar de 'filter'
    const visibleRows = table.rows({ search: 'applied' }).data().toArray(); // Usar 'search: applied'
  
    // Mapear los datos filtrados a un formato adecuado para jsPDF
    const rows = visibleRows.map((row: any) => [
      `${row[0]}`,       // Nombre
      `${row[1]}`,       // Rol
      `${row[2]}`,       // Lote
      `${row[3]}`,
      `${row[4]}`,
      `${row[5]}`,
    ]);
  
    // Generar la tabla en el PDF usando autoTable
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 30, // Ajusta la posición de inicio de la tabla
      theme: 'striped', // Tema de tabla con filas alternadas
      headStyles: { fillColor: [0, 0, 0] }, // Color de fondo del encabezado
      styles: { halign: 'center', valign: 'middle' }, // Alineación del contenido
      columnStyles: { 
        0: { cellWidth: 30 }, 
        1: { cellWidth: 30 }, 
        2: { cellWidth: 30 }, 
        3: { cellWidth: 30 }, 
        4: { cellWidth: 40 },
        5: { cellWidth: 40 }
      }, // Ajusta el ancho de las columnas
    });
  
    doc.save('lotes.pdf'); // Descarga el archivo PDF
  }

  //Exporta por excel los registros de la tabla
  exportExcel() {

    const table = $('#myTable').DataTable(); // Inicializa DataTable una vez
  
    // Cambia la forma de obtener las filas visibles usando 'search' en lugar de 'filter'
    const visibleRows = table.rows({ search: 'applied' }).data().toArray(); // Usar 'search: applied'

    // Filtrar a los lotes x aquellos que aparzcan en la tabla visibleRows
    let plots = this.plots.filter(plot => visibleRows.some(row => row[0] === plot.plot_number));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(plots.map(plot => ({
      Lote: plot.plot_number,
      Manzana: plot.block_number,
      M2: plot.total_area_in_m2,
      M2_Construidos: plot.built_area_in_m2,
      Tipo: plot.plot_type,
      Estado: plot.plot_state 
    })));
  
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lotes');
  
    XLSX.writeFile(wb, 'lotes.xlsx'); // Descarga el archivo Excel
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
      const modalRef = this.modal.open(UsersModaInfoPlotComponent, { size: 'md', keyboard: false });
      modalRef.componentInstance.plotModel = this.plotModel;

      modalRef.result.then((result) => {        
        $('#myTable').DataTable().ajax.reload();
      });

    } catch (error) {
      console.error('Error al abrir el modal:', error);
    }
  }

  
  redirectEdit(id: number) {
    this.router.navigate(['/home/plots/edit', id])
  }

  // Busca el user y se lo pasa al modal
  plotModel: GetPlotModel = new GetPlotModel();
   selectUser(id: number): Promise<GetPlotModel> {
       // Mostrar SweetAlert de tipo 'cargando'
     return new Promise((resolve, reject) => {
       this.apiService.getPlotById(id).subscribe({
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
             text: 'Hubo un problema al cargar el lote. Por favor, inténtalo de nuevo.'
           });
         }
       });
     });
  }
}

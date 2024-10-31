import { Component, OnInit, OnDestroy } from '@angular/core';
import { DetailServiceService } from '../../services/detail-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import { Details, PostDecrement } from '../../models/details';
declare var bootstrap: any;
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { EmpListadoEmpleados } from '../../models/emp-listado-empleados';
import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service';
import { IepCreateWarehouseMovementDTO } from '../../models/iep-create-warehouse-movement-dto';
import { WarehouseMovementService } from '../../services/warehouse-movement.service';
import { catchError, delay, Observable, Subscription } from 'rxjs';
import { Route } from '@angular/router';
@Component({
  selector: 'app-iep-detail-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './iep-detail-table.component.html',
  styleUrls: ['./iep-detail-table.component.css'],
})
export class IepDetailTableComponent implements OnInit, OnDestroy {
  details: Details[] = [];
  filteredDetails: Details[] = []; // Nueva lista para elementos filtrados
  private table: any;
  justificativo: string = '';
  selectedIds: number[] = [];
  private deleteModal: any;
  currentSearchTerm: string = ''; // Almacena el término de búsqueda actual

  //////
  idUser:number=1;
  reincorporationDate=false;
  selectedDetailstoShow: Details[] = [];
  loading: boolean = false;
  confirmPost: boolean = false;
  employees: EmpListadoEmpleados[] = [];
  dtoCreate: IepCreateWarehouseMovementDTO=new IepCreateWarehouseMovementDTO();
  createMovement$: Observable<any>= new Observable<any>();
  errorMessage: string | undefined;
  errorPost:boolean=false;
  optionsToMovement: string[] = [];


  private formatDateForInput(date: Date): Date {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    // Create a new date object with local timezone
    const formattedDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}`);
    return formattedDate;
  }



  constructor(private detailService: DetailServiceService,
    private employeesService: EmpListadoEmpleadosService,
    private warehouseService: WarehouseMovementService,
    private router:Router
  ) { }

  applyStateFilter(event: any): void {
    const selectedState = event.target.value;
    
    // Filtrar por estado y aplicar el filtro de búsqueda al mismo tiempo
    this.filteredDetails = this.details.filter(detail => {
      const matchesState = selectedState ? detail.state === selectedState : true;
      const matchesSearch = detail.description.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
                            detail.supplierName.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
                            detail.state.toLowerCase().includes(this.currentSearchTerm.toLowerCase());
      return matchesState && matchesSearch;
    });
  
    // Actualizar la tabla con los elementos filtrados
    this.table.clear().rows.add(this.filteredDetails).draw();
  }
  

  
  changeSelectEmployees(): void{
    console.log('Empleado seleccionado:', this.dtoCreate.employee_id);
    this.dtoCreate.applicant = this.employees.find(emp => emp.id === this.dtoCreate.employee_id)?.fullName ;
  }

  loadEmployees(): void {
    this.employeesService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        console.log('Empleados cargados con éxito:', data);
      },
      error: (err) => {
        console.error('Error al cargar empleados:', err);
      },
    });
  }

  onSubmit(form: NgForm) 
  {
    this.loading = true;
    this.confirmPost = false;
    this.errorPost=false;
    if(form.valid){
      this.dtoCreate.id_details = this.selectedIds;
      this.dtoCreate.responsible = 'Encargado de Inventario';
      console.log(".............");
      console.log(this.dtoCreate);
      this.createMovement$ = this.warehouseService.postWarehouseMovement(this.dtoCreate,this.idUser)
        .pipe(catchError((err) => {
          if(err.error.message=="Required request parameter 'idLastUpdatedUser' for method parameter type Integer is not present"){
            this.errorMessage = 'No se ha especificado el usuario que realiza el movimiento';
          }
          if(err.error.message=="404 Item not available to loan"){
            this.errorMessage = 'El producto no está disponible para préstamo';
          }
          if(err.error.message=='404 Item already available'){
            this.errorMessage = 'El producto ya está disponible';
          }
          if(err.error.message=='404 Item already in maintenance'){
            this.errorMessage = 'El producto ya está en mantenimiento';
          }
          this.errorPost=true;
          console.error('Error al registrar movimiento de almacén:', err);
          console.log(err.error.message);
          return [];
        }
        ));
    }else{
      console.log("Formulario inválido");
    }
    this.loading = false;
    if(this.createMovement$){
      this.confirmPost = true;
    }
  }

  cleanDTO(): void{
    this.dtoCreate = new IepCreateWarehouseMovementDTO();
    this.dtoCreate.date = new Date().toISOString().slice(0, 16);
    this.dtoCreate.reinstatement_datetime = new Date().toISOString().slice(0, 16);
    this.dtoCreate.id_details = [];
    this.dtoCreate.employee_id = 0;
    this.dtoCreate.applicant = '';
    this.toggleSelectAll({ target: { checked: false } });
    this.confirmPost = false;
    this.optionsToMovement = [];
    this.selectedIds = [];
    this.loadDetails();
  }

 

  onChangeEmployee(): void {
    var applicantString;
    for (let i = 0; i < this.employees.length; i++) {
      if (this.employees[i].id == this.dtoCreate.employee_id) {
        applicantString = this.employees[i].fullName;
      }
    }
    this.dtoCreate.applicant = applicantString;
  }




  ngOnInit(): void {
    this.loadDetails();
    this.loadEmployees();
    this.initializeModal();
    this.dtoCreate.date = new Date().toISOString().slice(0, 16);
    this.dtoCreate.reinstatement_datetime = new Date().toISOString().slice(0, 16);
    this.dtoCreate.id_details = [];
    this.dtoCreate.employee_id = undefined;
    this.dtoCreate.applicant = '';
    this.dtoCreate.responsible = 'Encargado de Inventario';
    const modalElement = document.getElementById('warehouseModal');
    const modalDeleteElement = document.getElementById('confirmDeleteModal');
  // Agregar listener para clics en el backdrop
    document.addEventListener('click', (event: any) => {
    if (event.target === modalElement || event.target === modalDeleteElement) {
      // El clic fue en el backdrop
      console.log('Clic en el backdrop');
      this.confirmPost=false;
      this.cleanDTO();
      // o cualquier otro método
    }
  });
  }

  initializeModal(): void {
    this.deleteModal = new bootstrap.Modal(
      document.getElementById('confirmDeleteModal')
    );
  }

  loadDetails(): void {

    this.detailService.getDetails().subscribe({
      next: (details) => {
        if(this.details.length==0){
          this.details = details;
          this.filteredDetails = details; 
          this.initializeDataTable();
        }else{
          this.details = details;
          this.filteredDetails = details; 
          this.updateDataTable();
        }
        // Inicializa el filtro con todos los elementos
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
      },
    });
  }

   applyFilter(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredDetails = this.details.filter(detail =>
      detail.description.toLowerCase().includes(searchTerm) ||
      detail.supplierName.toLowerCase().includes(searchTerm) ||
      detail.state.toLowerCase().includes(searchTerm)
    );

    this.currentSearchTerm = event.target.value.toLowerCase();
    this.applyStateFilter({ target: { value: (document.getElementById('estadoSelect') as HTMLSelectElement).value } });

    this.table.clear().rows.add(this.filteredDetails).draw(); // Actualiza la tabla con los elementos filtrados
  }

  updateDataTable(): void {
    this.table.clear().rows.add(this.filteredDetails).draw();
  }

  initializeDataTable(): void {
    if (this.table) {
      this.table.destroy();
      $('#productTable').empty();
    }

    this.table = $('#productTable').DataTable({
      dom:
      '<"mb-3"t>' +                           
      '<"d-flex justify-content-between"lp>', 
      //dom: '<"d-flex justify-content-between align-items-center mb-3"<"d-flex align-items-center gap-2"f><"select-all-wrapper">>rt<"d-flex justify-content-end"p>',
      //dom: '<"d-flex justify-content-between align-items-center mb-3"f<"select-all-wrapper">>rt<"d-flex justify-content-end"p>', // Paginación a la derecha
      /*       layout: {
              topStart: 'search',
              topEnd: null
            }, */
      data: this.filteredDetails, // Cambia `details` a `filteredDetails`
      columns: [
        { data: 'description', title: 'Descripción' },
        { data: 'supplierName', title: 'Nombre del Proveedor' },
        { data: 'state', title: 'Estado' },
        {
          data: 'price',
          title: 'Precio',
          className: 'text-end',
          render: (data: number) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(data);
          },
        },
        {
          data: null,
          title: 'Seleccionar',
          className: 'text-center',
          render: (data: any) => {
            const isChecked = this.selectedIds.includes(data.id)
              ? 'checked'
              : '';
            return `<input type="checkbox" class="form-check-input selection-checkbox" data-id="${data.id}" ${isChecked} />`;
          },
        },
      ],
      pageLength: 10,
      lengthChange: true, // Permitir que el usuario cambie el número de filas mostradas
      lengthMenu: [ // Opciones para el menú desplegable de longitud
        [10, 25, 50], // Valores para el número de filas
        [10, 25, 50] // Etiquetas para el número de filas
      ],
      searching: false, // Desactivar la búsqueda
      language: {
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        emptyTable: 'No se encontraron resultados', // Mensaje personalizado si no hay datos   
        paginate: {
          first: '<<',
          last: '>>',
          next: '>',
          previous: '<',
        },
        lengthMenu: '_MENU_', // Etiqueta para el menú de longitud
      },
      initComplete: function () {
        // Agregar el checkbox "Seleccionar todos" después de que DataTable se inicialice
        $('.select-all-wrapper').html(`
          <div class="form-check ms-3">
            <input class="form-check-input" type="checkbox" id="selectAll">
            <label class="form-check-label" for="selectAll">
              Seleccionar todos
            </label>
          </div>
        `);
      }
    });

    // Agregar el evento al checkbox después de que se cree
    $(document).on('change', '#selectAll', (event) => {
      this.toggleSelectAll(event);
    });

    $('#productTable').on('change', '.selection-checkbox', (event) => {
      const checkbox = event.target as HTMLInputElement;
      const id = parseInt(checkbox.getAttribute('data-id') || '0', 10);
      this.toggleSelection(id);
    });

    // Actualizar checkboxes cuando cambia la página
    this.table.on('draw', () => {
      this.updateCheckboxStates();
      // Actualizar el estado del checkbox "Seleccionar todos"
      const selectAllCheckbox = document.getElementById('selectAll') as HTMLInputElement;
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = this.areAllSelected();
      }
    });
  }

  // Nuevo método para actualizar el estado visual de los checkboxes
  updateCheckboxStates(): void {
    $('.selection-checkbox').each((index: number, element: HTMLElement) => {
      const checkbox = element as HTMLInputElement;
      const id = parseInt(checkbox.getAttribute('data-id') || '0', 10);
      checkbox.checked = this.selectedIds.includes(id);
    });
  }

  areAllSelected(): boolean {
    return (
      this.details.length > 0 && this.selectedIds.length === this.details.length
    );
  }

  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selectedIds = this.details.map((detail) => detail.id);
    } else {
      this.selectedIds = [];
    }
    // Actualizar los checkboxes visualmente
    this.updateCheckboxStates();
  }

  toggleSelection(id: number): void {
    const index = this.selectedIds.indexOf(id);
    if (index > -1) {
      this.selectedIds.splice(index, 1);
    } else {
      this.selectedIds.push(id);
    }
  }

  confirmDelete(): void {
    if (this.selectedIds.length > 0 && this.justificativo.trim() !== '') {
      const postDecrement: PostDecrement = {
        justify: this.justificativo,
        ids: this.selectedIds,
      };

      this.detailService.postDecrement(postDecrement).subscribe({
        next: (response) => {
          console.log('Productos eliminados con éxito:', response);
          // Primero ocultamos el modal
          this.deleteModal.hide();
          // Removemos manualmente el backdrop y las clases modal-open
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
          // Luego recargamos los datos y reseteamos
          this.loadDetails();
          this.resetSelectionAndJustification();
        },
        error: (err) => {
          console.error('Error al eliminar productos:', err);
          // Misma limpieza en caso de error
          this.deleteModal.hide();
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
          this.loadDetails();
          this.resetSelectionAndJustification();
        },
      });
    }
  }

  resetSelectionAndJustification(): void {
    this.selectedIds = [];
    this.justificativo = '';
    // Actualizar el estado visual de los checkboxes
    this.updateCheckboxStates();
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }

  volverInventario(): void {
    // Implementa la lógica para volver al inventario
    this.router.navigate(["inventario"])
  }

  // Método para exportar a Excel
  generateExcel(): void {
    const dataToExport = this.details.map(detail => ({
      Descripción: detail.description,
      'Nombre del Proveedor': detail.supplierName,
      Estado: detail.state,
      Precio: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(detail.price),
    }));

    // Crear un libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalles de Productos');

    // Guardar el archivo
    XLSX.writeFile(workbook, 'Listado_Productos.xlsx');
  }

  // Método para exportar a PDF
  generatePDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Listado de Productos', 10, 10);

    const dataToExport = this.details.map(detail => [
      detail.description,
      detail.supplierName,
      detail.state,
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(detail.price),
    ]);

    // Añadir la tabla al PDF
    (doc as any).autoTable({
      head: [['Descripción', 'Nombre del Proveedor', 'Estado', 'Precio']],
      body: dataToExport,
      startY: 20,
    });

    // Guardar el PDF
    doc.save('Listado_Productos.pdf');
  }
}

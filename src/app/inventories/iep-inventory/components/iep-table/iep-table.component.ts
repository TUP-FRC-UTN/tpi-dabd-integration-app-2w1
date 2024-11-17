import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import 'datatables.net';
import 'datatables.net-bs5';
import $, { param } from 'jquery';
import * as XLSX from 'xlsx';
import { GenerateExcelPdfService } from '../../../common-services/generate-excel-pdf.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Producto } from '../../models/producto';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { routes } from '../../../app.routes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-iep-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './iep-table.component.html',
  styleUrls: ['./iep-table.component.css'],
})
export class IepTableComponent implements OnInit, AfterViewInit, OnDestroy {
  private table: any;
  productos: Producto[] = [];
  filteredProductos: Producto[] = [];
  fechaMaxima: string='';

  movementTypeOptions = [
    { label: 'Disminución', value: 'disminución' },
    { label: 'Aumento', value: 'aumento' }
  ];
  

  // Filtros
  globalFilter: string = '';
  startDate: string | undefined;
  endDate: string | undefined;
  selectedMovementTypes: string[] = [];



  goTo(params:string) {
    this.router.navigate([params]) 
   }

   applyAllFilters(): void {
    // Comenzar con todos los productos
    let filteredResults = [...this.productos];

    // 1. Aplicar filtro global si existe
    if (this.globalFilter && this.globalFilter.trim() !== '') {
      const filterValue = this.globalFilter.toLowerCase();
      filteredResults = filteredResults.filter(
        (producto) =>
          producto.product.toLowerCase().includes(filterValue) ||
          producto.modificationType.toLowerCase().includes(filterValue) ||
          producto.description.toLowerCase().includes(filterValue)||
          producto.supplier.toLowerCase().includes(filterValue)
          
      );
    }

    // 2. Aplicar filtro de fechas si existen
    if (this.startDate || this.endDate) {
      filteredResults = filteredResults.filter((producto) => {
        const productDate = new Date(this.formatDateyyyyMMdd(producto.date));
        const start = this.startDate ? new Date(this.startDate) : null;
        const end = this.endDate ? new Date(this.endDate) : null;

        return (!start || productDate >= start) && (!end || productDate <= end);
      });
    }

    // 3. Aplicar filtro de tipo de movimiento si hay seleccionados
    if (this.selectedMovementTypes.length > 0) {
      filteredResults = filteredResults.filter((producto) =>
        this.selectedMovementTypes.includes(
          producto.modificationType.toLowerCase()
        )
      );
    }

    // 4. Aplicar filtros de cantidad mínima y máxima si existen
    if (this.minAmount !== null) {
      let minAmount = this.minAmount;
      filteredResults = filteredResults.filter(
        (producto) => producto.amount >= minAmount
      );
    }
    if (this.maxAmount !== null) {
      let maxAmount = this.maxAmount;
      filteredResults = filteredResults.filter(
        (producto) => producto.amount <= maxAmount
      );
    }

    // Actualizar los resultados filtrados
    this.filteredProductos = filteredResults;

    // Actualizar DataTable si existe
    if (this.table) {
      this.table.clear().rows.add(this.filteredProductos).draw();
    }
  }

  minAmount: number | null = null;
  maxAmount: number | null = null;
  filterValues: { [key: string]: string } = {
    product: '',
    description: ''
  };

  // Propiedad para controlar el estado del botón
  isApplyButtonDisabled: boolean = false;


  exportButtonsEnabled: boolean = true; // Controla la habilitación de los botones
  private stockMap: Map<string, number> = new Map();

  constructor(
    private productService: ProductService,
    private excelPdfService: GenerateExcelPdfService,
    private router : Router
  ) { 
    const hoy = new Date();
    this.fechaMaxima = hoy.toISOString().split('T')[0];
  }




  applyFilter(): void {
    this.applyAllFilters();
  }



  onStartDateChange(): void {
  }

  onEndDateChange(): void {
  }

  ngOnInit(): void {
    const hoy = new Date();
    const hace30Dias = new Date();
    this.endDate = hoy.toISOString().split('T')[0];
    // Inicializar la fecha de inicio con la fecha actual menos 30 dias
    hace30Dias.setDate(hoy.getDate() - 30);
    this.startDate = hace30Dias.toISOString().split('T')[0];
    this.setInitialDates();
    this.loadProductos(); // Carga los productos al inicializar el componente
  }

  setInitialDates(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDateInput: HTMLInputElement = document.getElementById(
      'startDate'
    ) as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById(
      'endDate'
    ) as HTMLInputElement;

    startDateInput.value = this.formatDateForInput(thirtyDaysAgo);
    endDateInput.value = this.formatDateForInput(today);
    // Trigger the filter
    this.filterByDate();
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  ngAfterViewInit(): void {
    this.initializeDataTable(); // Inicializa DataTable después de que la vista esté lista
  }

  // Método para cargar productos desde el servicio
  loadProductos(): void {
    this.productService.getProductos().subscribe({
      next: (productos) => {
        this.productos = this.calculateRunningStock(productos);
        this.filteredProductos = [...this.productos];
        this.applyAllFilters(); // Aplicar todos los filtros inicialmente

        if (this.table) {
          this.table.destroy();
        }
        this.initializeDataTable();
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  calculateRunningStock(productos: Producto[]): Producto[] {
    const stockMap = new Map<string, number>();

    return productos.map((producto) => {
      const currentStock = stockMap.get(producto.product) || 0;
      let newStock: number;

      if (producto.modificationType === 'Aumento') {
        newStock = currentStock + producto.amount;
      } else if (producto.modificationType === 'Disminución') {
        newStock = currentStock - producto.amount;
      } else {
        newStock = currentStock; // En caso de otro tipo de movimiento
      }

      stockMap.set(producto.product, newStock);

      return {
        ...producto,
        date: this.formatDate(producto.date),
        stockAfterModification: newStock,
      };
    });
  }

  // Método para formatear la fecha al formato dd/MM/yyyy
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Método que inicializa el DataTable
  initializeDataTable(): void {
    this.table = $('#historialTable').DataTable({
      /*       layout: {
              topStart: 'search',
              topEnd: null,
            }, */
      dom:
        '<"mb-3"t>' +                           //Tabla
        '<"d-flex justify-content-between"lp>', //Paginacion
      data: this.filteredProductos, // Usar la lista filtrada
      columns: [
        {
          data: 'date',
          title: 'Fecha',
          render: (data, type, row) => {
            if (type === 'display') {
              return data; // Mantiene el formato dd/MM/yyyy para mostrar
            }
            if (type === 'sort') {
              // Convierte la fecha dd/MM/yyyy a formato sorteable
              const [day, month, year] = data.split('/');
              return `${year}${month}${day}`; // Formato yyyyMMdd para ordenamiento
            }
            return data;
          }
        },
        {
          data: 'modificationType',
          title: 'Tipo de Movimiento',
          render: (data: string) => {
            let colorClass;
            switch (data) {
              case 'Aumento':
                return `<span class="badge" style = "background-color: #0d6efd;" > Aumento </span>`;
              case 'Disminución':
                return `<span class="badge" style = "background-color: #dc3545;" > Disminución </span>`;
              default:
                return data;
            }
          }
        }, // Columna de tipo de movimiento
        { data: 'product', title: 'Artículo' }, // Columna de producto
        {data: 'supplier',title : 'Proveedor'},

        { data: 'amount', title: 'Cantidad' }, // Columna de cantidad
        { data: 'stockAfterModification', title: 'Stock Resultante' },
        { data: 'description', title: 'Justificativo' }, 
        // Columna de justificativo

      ],
      pageLength: 5,
      lengthChange: true, // Permitir que el usuario cambie el número de filas mostradas
      lengthMenu: [ // Opciones para el menú desplegable de longitud
        [5, 10, 25, 50], // Valores para el número de filas
        [5, 10, 25, 50] // Etiquetas para el número de filas
      ],
      searching: false, // Desactivar la búsqueda
      order: [[0, 'desc']], // Ordenar por fecha de forma descendente
      language: {
        lengthMenu: '_MENU_', // Esto eliminará el texto "entries per page"
        search: 'Buscar:',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        emptyTable: 'No se encontraron movimientos', // Mensaje personalizado si no hay datos        
      },
    });
  }

  // Método para filtrar los productos por fecha
  filterByDate(): void {
    const startDateInput: HTMLInputElement = document.getElementById(
      'startDate'
    ) as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById(
      'endDate'
    ) as HTMLInputElement;

    const startDate = startDateInput.value
      ? new Date(startDateInput.value)
      : null;
    const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

    // Validar que las fechas sean válidas
    if (startDate && endDate && startDate > endDate) {
      //alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
      startDateInput.value = '';
      endDateInput.value = '';
      return;
    }

    this.filteredProductos = this.productos.filter((producto) => {
      const productDate = new Date(this.formatDateyyyyMMdd(producto.date));
      return (
        (!startDate || productDate >= startDate) &&
        (!endDate || productDate <= endDate)
      );
    });

    // Actualizar el DataTable
    if (this.table) {
      this.table.clear().rows.add(this.filteredProductos).draw(); // Actualiza la tabla con los productos filtrados
    }
  }

  formatDateyyyyMMdd(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }

  getFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes desde 0
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
  }

  // Método que genera el PDF
  exportToPdf(): void {
    if (!this.filteredProductos.length) {
      console.error('No hay datos para exportar');
      return;
    }

    const doc = new jsPDF();

    const pageTitle = 'Lista Reporte de Productos';
    doc.setFontSize(18);
    doc.text(pageTitle, 15, 10);

    const tableData = this.filteredProductos.map((producto) => [
      producto.date, 
      producto.product,
      producto.modificationType,
      producto.amount.toString(),
      producto.description,
      producto.stockAfterModification, 
    ]);

    const headers = [
      'Fecha',
      'Producto',
      'Tipo Movimiento',
     
      'Cantidad',
      'Justificativo',
      'Stock Resultante',
    ];

    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 30,
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
    });

    const formattedDate = this.getFormattedDate();
    doc.save(`${formattedDate}_Reporte_Productos.pdf`)
  }

  exportToExcel(): void {
    if (!this.filteredProductos.length) {
      console.error('No hay datos para exportar');
      return;
    }
  
    const data = this.filteredProductos.map((producto) => [
      producto.date, 
      producto.product, 
      producto.supplier,
      producto.modificationType, 
      producto.amount, 
      producto.description,
      producto.stockAfterModification, 
    ]);
  
    const encabezado = [
      ['Historial de Productos'], 
      [], 
      ['Fecha', 'Artículo', 'Tipo Movimiento', 'Cantidad', 'Justificativo', 'Stock Resultante'], // Nombres de las columnas
    ];
  
    const worksheetData = [...encabezado, ...data];
  
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
    worksheet['!cols'] = [
      { wch: 12 }, 
      { wch: 20 }, 
      { wch: 20 }, 
      { wch: 20 }, 
      { wch: 15 }, 
      { wch: 30 }, 
      { wch: 15 }, 
    ];
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial');
  
    const formattedDate = this.getFormattedDate();
    XLSX.writeFile(workbook, `${formattedDate}_Reporte_Productos.xlsx`);
  }
  
  

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy(); 
    }
  }


  filtersVisible = true; 


  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible; 
    if (this.filtersVisible) {
      this.cleanColumnFilters(); 
    }
  }

  applyAmountFilter(type: 'min' | 'max', event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value ? parseFloat(input.value) : null;

    if (type === 'min') {
      this.minAmount = value;
    } else {
      this.maxAmount = value;
    }

    // Validar si el máximo es menor que el mínimo
    this.validateAmountRange();
    this.applyAllFilters()
  }

  validateAmountRange(): void {
    if (this.minAmount !== null && this.maxAmount !== null) {
      this.isApplyButtonDisabled = this.maxAmount < this.minAmount;
    } else {
      this.isApplyButtonDisabled = false;
    }
  }

  applyColumnFilter(event: Event, column: string): void {
    if (column === 'modificationType') {
      const checkbox = event.target as HTMLInputElement;
      const value = checkbox.value.toLowerCase();

      if (checkbox.checked) {
        this.selectedMovementTypes.push(value);
      } else {
        const index = this.selectedMovementTypes.indexOf(value);
        if (index > -1) {
          this.selectedMovementTypes.splice(index, 1);
        }
      }
      this.applyAllFilters();
    }
  }

  cleanColumnFilters(): void {
    this.globalFilter = '';
    this.startDate = undefined;
    this.endDate = undefined;
    this.selectedMovementTypes = [];
    // Resetear checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: Element) => {
      (checkbox as HTMLInputElement).checked = false;
    });
    // Resetear inputs de cantidad
    const amountInputs = document.querySelectorAll('input[type="number"]');
    amountInputs.forEach((input: Element) => {
      (input as HTMLInputElement).value = '';
    });

    // Restablecer los productos sin filtrar
    this.filteredProductos = [...this.productos];

    // Actualizar DataTable
    if (this.table) {
      this.table.clear().rows.add(this.filteredProductos).draw();
    }
  }
}

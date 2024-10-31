import { Component, Input, OnDestroy, OnInit, AfterViewInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import 'datatables.net-buttons/js/dataTables.buttons.js';
import 'datatables.net-buttons/js/buttons.html5.js';
import 'datatables.net-buttons/js/buttons.print.js';
import 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import 'jszip';
import Swal from 'sweetalert2';

// Definir interface para los filtros
interface FilterValues {
  entryOrExit: Set<string>;
  tipoIngresante: Set<string>;
  nombreIngresante: string;
  documento: string;
  typeCar: Set<string>;
  lateInRange: Set<string>;
}

@Component({
  selector: 'app-access-table',
  standalone: true,
  imports: [DataTablesModule, CommonModule, HttpClientModule],
  templateUrl: './access-table.component.html',
  styleUrl: './access-table.component.css'
})
export class AccessTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedYear: number | null = null;
  @Input() selectedMonth: number | null = null;

  movements: any[] = [];
  table: any = null;
  exportButtonsEnabled: boolean = false;
  
  // Almacenar los valores de los filtros usando la interface
  filterValues: FilterValues = {
    entryOrExit: new Set<string>(),
    tipoIngresante: new Set<string>(),
    nombreIngresante: '',
    documento: '',
    typeCar: new Set<string>(),
    lateInRange: new Set<string>()
  };

  // Mapeos para los filtros
  private readonly entryOrExitMap: { [key: string]: string } = {
    'entry': 'entrada',
    'exit': 'salida'
  };

  private readonly tipoIngresanteMap: { [key: string]: string } = {
    'employee': 'empleado',
    'suplied': 'proveedor',
    'constructionworker': 'obrero',
    'administrator': 'administracion',
    'services': 'servicio'
  };

  private readonly typeCarMap: { [key: string]: string } = {
    'car': 'auto',
    'motorcycle': 'moto',
    'truck': 'camion',
    'bike': 'bicicleta',
    'van': 'camioneta',
  };

  private readonly lateInRangeMap: { [key: string]: string } = {
    'inrange': 'en horario',
    'late': 'tarde',
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedYear'] || changes['selectedMonth']) {
      this.fetchData();
    }
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
      while ($.fn.dataTable.ext.search.length > 0) {
        $.fn.dataTable.ext.search.pop();
      }
    }
    this.removeEventListeners();
  }

  private removeEventListeners(): void {
    $('.dropdown-menu input[type="checkbox"]').off();
    $('#nombreIngresanteFilter, #documentoFilter').off();
    $('.dropdown-menu').off();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDataTable();
      this.setupFilters();
      this.setupDropdowns();
    });
  }

  fetchData(): void {
    if (this.selectedYear && this.selectedMonth) {
      this.http.get<any>(`http://localhost:8090/movements_entryToHood/ByMonth?year=${this.selectedYear}&month=${this.selectedMonth}`)
        .subscribe({
          next: (response) => {
            console.log('API Response:', response);
            this.movements = response.data;
            this.loadDataIntoTable();
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: '¡Error!',
              text: 'Ocurrió un error al intentar cargar los datos. Por favor, intente nuevamente.',
            });
          }
        });
    }
  }

  initializeDataTable(): void {
    this.table = ($('#myTable') as any).DataTable({
      paging: true,
      ordering: false,
      pageLength: 10,
      lengthChange: true,
      searching: true,
      info: true,
      autoWidth: false,
      language: {
        lengthMenu: "Mostrar _MENU_ registros",
        zeroRecords: "No se encontraron registros",
        info: "Mostrando de _START_ a _END_ de _TOTAL_ registros",
        infoEmpty: "No hay registros disponibles",
        infoFiltered: "(filtrado de _MAX_ registros totales)",
        search: "Buscar:",
        paginate: {
          first: "Primero",
          last: "Último",
          next: "Siguiente",
          previous: "Anterior"
        },
        emptyTable: "No hay datos disponibles",
      },
      responsive: true,
      dom: 'Bfrtip',
      buttons: [
        {
          extend: 'excel',
          text: '<i class="fas fa-file-excel"></i> ',
          className: 'btn btn-success ms-2',
          titleAttr: 'Exportar a Excel'
        },
        {
          extend: 'pdf',
          text: '<i class="fas fa-file-pdf"></i> ',
          className: 'btn btn-danger ms-2',
          titleAttr: 'Exportar a PDF',
          orientation: 'portrait'
        },
        {
          extend: 'print',
          text: '<i class="fas fa-print"></i> ',
          className: 'btn btn-primary ms-2',
          titleAttr: 'Imprimir tabla'
        }
      ]
    });

    this.table.on('draw', () => {
      const recordCount = this.table.rows({ filter: 'applied' }).count();
      this.exportButtonsEnabled = recordCount > 0;
    });
  }

  setupDropdowns(): void {
    $('.dropdown-menu input[type="checkbox"]').on('click', (e) => {
      e.stopPropagation();
      const checkbox = $(e.target);
      const value = checkbox.val() as string;
      const isChecked = checkbox.prop('checked');
      const dropdownId = checkbox.closest('.dropdown').find('button').attr('id');

      switch (dropdownId) {
        case 'dropdownEntryExit':
          this.updateFilterSet('entryOrExit', value, isChecked);
          break;
        case 'dropdownTipoIngresante':
          this.updateFilterSet('tipoIngresante', value, isChecked);
          break;
        case 'dropdownTypecar':
          this.updateFilterSet('typeCar', value, isChecked);
          break;
        case 'dropdownLateInRange':
          this.updateFilterSet('lateInRange', value, isChecked);
          break;
      }

      const dropdown = checkbox.closest('.dropdown');
      const selectedCount = dropdown.find('input:checked').length;
      dropdown.find('.selected-count').text(selectedCount > 0 ? `(${selectedCount})` : '');

      if (this.table) {
        this.table.draw();
      }
    });

    $('.dropdown-menu').on('click', (e) => {
      e.stopPropagation();
    });
  }

  private updateFilterSet(filterName: keyof FilterValues, value: string, isChecked: boolean): void {
    const filter = this.filterValues[filterName];
    if (filter instanceof Set) {
      if (isChecked) {
        filter.add(value.toLowerCase());
      } else {
        filter.delete(value.toLowerCase());
      }
    }
  }

  setupFilters(): void {
    $('#nombreIngresanteFilter, #documentoFilter').on('keyup', (e) => {
      const target = $(e.target);
      const inputValue = target.val() as string;

      if (inputValue.length < 3) {
        // Si la longitud es menor a 3 caracteres, limpiar el filtro y no aplicar
        if (target.attr('id') === 'nombreIngresanteFilter') {
          this.filterValues.nombreIngresante = '';
        } else {
          this.filterValues.documento = '';
        }
        if (this.table) {
          this.table.draw();
        }
        return;
      }

      // Si tiene al menos 3 caracteres, actualizar el valor del filtro
      if (target.attr('id') === 'nombreIngresanteFilter') {
        this.filterValues.nombreIngresante = inputValue;
      } else {
        this.filterValues.documento = inputValue;
      }

      if (this.table) {
        this.table.draw();
      }
    });

    $.fn.dataTable.ext.search.push(
      (settings: any, data: string[], dataIndex: number) => {
        return this.filterRow(data);
      }
    );
  }

  private filterRow(data: string[]): boolean {
    if (this.filterValues.entryOrExit.size > 0 && 
        !Array.from(this.filterValues.entryOrExit).some(value => 
          data[0].toLowerCase() === this.entryOrExitMap[value])) {
      return false;
    }

    if (this.filterValues.tipoIngresante.size > 0 && 
        !Array.from(this.filterValues.tipoIngresante).some(value => 
          data[1].toLowerCase() === this.tipoIngresanteMap[value])) {
      return false;
    }

    if (this.filterValues.nombreIngresante && 
        !data[2].toLowerCase().includes(this.filterValues.nombreIngresante.toLowerCase())) {
      return false;
    }

    if (this.filterValues.documento && 
        !data[3].toLowerCase().includes(this.filterValues.documento.toLowerCase())) {
      return false;
    }

    if (this.filterValues.typeCar.size > 0 && 
        !Array.from(this.filterValues.typeCar).some(value => 
          data[5].toLowerCase() === this.typeCarMap[value])) {
      return false;
    }

    if (this.filterValues.lateInRange.size > 0 && 
        !Array.from(this.filterValues.lateInRange).some(value => 
          data[7].toLowerCase() === this.lateInRangeMap[value])) {
      return false;
    }

    return true;
  }

  loadDataIntoTable(): void {
    console.log('Movements:', this.movements);
    if (this.table) {
      this.table.clear();

      if (Array.isArray(this.movements) && this.movements.length > 0) {
        this.movements.forEach(movement => {
          this.table.row.add([
            movement.entryOrExit || '',
            movement.entryType || '',
            movement.visitorName || '',
            movement.visitorDocument || '',
            movement.observations || '',
            movement.carType || '',
            movement.plate || '',
            movement.lateOrNot || '',
            movement.hour || '',
            movement.day + '/' + movement.month + '/' + movement.year,
          ]);
        });
        this.exportButtonsEnabled = true;
      } else {
        Swal.fire({
          icon: 'warning',
          title: '¡No se encontraron registros!',
        });
        this.exportButtonsEnabled = false;
      }

      this.table.draw();
    } else {
      this.initializeDataTable();
    }
  }
}
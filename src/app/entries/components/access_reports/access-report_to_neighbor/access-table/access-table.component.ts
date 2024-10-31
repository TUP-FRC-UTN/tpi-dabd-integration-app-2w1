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


interface FilterValues {
  entryOrExit: Set<string>;
  tipoIngresante: Set<string>;
  nombreIngresante: string;
  documento: string;
  typeCar: Set<string>;
  propietario: string;
  lateInRange: Set<string>;
  plate: string;
  days: Set<string>;
}

interface DataTableButtons {
  new (dt: any, config: any): any;
}

@Component({
  selector: 'app-access-table',
  standalone: true,
  imports: [DataTablesModule, CommonModule, HttpClientModule],
  templateUrl: './access-table.component.html',
  styleUrls: ['./access-table.component.css']
})
export class AccessTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedYear: number | null = null;
  @Input() selectedMonth: number | null = null;

  movements: any[] = [];
  table: any = null;
  exportButtonsEnabled: boolean = false;
  days: number[] = [];
  showFilters = false;


  filterValues: FilterValues = {
    entryOrExit: new Set<string>(),
    tipoIngresante: new Set<string>(),
    nombreIngresante: '',
    documento: '',
    typeCar: new Set<string>(),
    propietario: '',
    lateInRange: new Set<string>(),
    plate: '',
    days: new Set<string>()
  };

  private readonly entryOrExitMap: { [key: string]: string } = {
    'entry': 'entrada',
    'exit': 'salida'
  };

  private readonly tipoIngresanteMap: { [key: string]: string } = {
    'neighbour': 'vecino',
    'visitor': 'visitante',
    'delivery': 'delivery',
    'constructionworker': 'obrero',
    'suplier': 'proveedor',
    'employee': 'empleado',
    'services': 'servicios',
  };

  private readonly typeCarMap: { [key: string]: string } = {
    'car': 'auto',
    'motorcycle': 'moto',
    'truck': 'camion',
    'bike': 'bicicleta',
    'van': 'camioneta',
    'walk': 'sin vehículo',
  };

  private readonly lateInRangeMap: { [key: string]: string } = {
    'inrange': 'en horario',
    'late': 'tarde',
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.generateDays();
    this.fetchData();
  }

  private generateDays(): void {
    this.days = Array.from({ length: 31 }, (_, i) => i + 1);
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
    $('#excelBtn, #pdfBtn, #printBtn').off('click');
  }

  private removeEventListeners(): void {
    $('.dropdown-menu input[type="checkbox"]').off();
    $('#nombreIngresanteFilter, #documentoFilter, #propietarioFilter, #placaFilter').off();
    $('.dropdown-menu').off();
    $('#advancedFiltersToggle').off();
  }

  toggleAdvancedFilters(): void {
    const advancedFilters = document.getElementById('advancedFilters');
    if (advancedFilters) {
      advancedFilters.classList.toggle('show');
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDataTable();
      this.setupFilters();
      this.setupDropdowns();
    });
  }
  clearFilters(): void {
   
    $('.dropdown-menu input[type="checkbox"]').prop('checked', false);
    

    $('#nombreIngresanteFilter, #documentoFilter, #propietarioFilter, #placaFilter').val('');
    
  
    $('.dropdown button .selected-count').text('');
    

    this.filterValues = {
      entryOrExit: new Set<string>(),
      tipoIngresante: new Set<string>(),
      nombreIngresante: '',
      documento: '',
      typeCar: new Set<string>(),
      propietario: '',
      lateInRange: new Set<string>(),
      plate: '',
      days: new Set<string>()
    };
    
  
    if (this.table) {
      this.table.draw();
    }
  }

  fetchData(): void {
    if (this.selectedYear && this.selectedMonth) {
      this.http.get<any>(`http://localhost:8090/movements_entryToNeighbor/ByMonth?year=${this.selectedYear}&month=${this.selectedMonth}`)
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
    else {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      this.http.get<any>(`http://localhost:8090/movements_entryToNeighbor/ByMonth?year=${year}&month=${month}`)
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
        lengthMenu:  " _MENU_ ",
        zeroRecords: "No se encontraron registros",
        info: "Mostrando de _START_ a _END_ de _TOTAL_ registros",
        infoEmpty: "No se encontraron resultados",
        infoFiltered: "(filtrado de _MAX_ registros totales)",
        search: "Buscar:",
        emptyTable: "No se encontraron resultados",
      },
      responsive: true,
      dom: 'rt<"bottom d-flex justify-content-between align-items-center"<"d-flex align-items-center gap-3"l i> p><"clear">',
      drawCallback: function(settings: any) {
        const table = this;
        setTimeout(function() {
          $(table).find('td:nth-child(3)').each(function() {
            const cellText = $(this).text().trim().toLowerCase();
            if (cellText === 'entrada') {
                $(this).html(`
                    <div class="d-flex justify-content-center">
                        <button type="button" class="btn rounded-pill w-75" 
                            style="background-color: #28a745; color: white; border: none; text-transform: uppercase;">
                            ${cellText.charAt(0).toUpperCase() + cellText.slice(1)}
                        </button>
                    </div>
                `);
            } else if (cellText === 'salida') {
                $(this).html(`
                    <div class="d-flex justify-content-center">
                        <button type="button" class="btn rounded-pill w-75" 
                            style="background-color: #dc3545; color: white; border: none; text-transform: uppercase;">
                            ${cellText.charAt(0).toUpperCase() + cellText.slice(1)}
                        </button>
                    </div>
                `);
            }
        });
          $(table).find('td:nth-child(12)').each(function() { // Ajustado para la nueva posición del estado de horario
            const estadoText = $(this).text().trim();
            if (estadoText === 'Tarde') {
              $(this).css("color", "red");
              $(this).html(`<i class="fa-solid fa-triangle-exclamation"></i> ${estadoText}`);
            } else if (estadoText === 'En horario') {
              $(this).css("color", "green");
              $(this).html(`<i class="fa-solid fa-circle-check"></i> ${estadoText}`);
            }
          });
        }, 0);
      }
    });

    $('#excelBtn').on('click', () => {
      if (!this.exportButtonsEnabled) return;
      this.table.button('.buttons-excel').trigger();
    });

    $('#pdfBtn').on('click', () => {
      if (!this.exportButtonsEnabled) return;
      this.table.button('.buttons-pdf').trigger();
    });

    $('#printBtn').on('click', () => {
      if (!this.exportButtonsEnabled) return;
      this.table.button('.buttons-print').trigger();
    });

    const DataTableButtons = ($.fn.dataTable as any).Buttons as DataTableButtons;
    const buttons = new DataTableButtons(this.table, {
      buttons: [
        {
          extend: 'excel',
          text: 'Excel',
          className: 'buttons-excel d-none',
          filename: () => {
            const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const month = this.selectedMonth ? monthNames[this.selectedMonth - 1] : monthNames[new Date().getMonth()];
            return `Movimientos de ${month}`;
          },
          exportOptions: {
            columns: ':visible'
          },
          title: `LISTADO MENSUAL DE INGRESOS/EGRESOS - 
                  Fecha de emisión ${new Date().toLocaleDateString('es-AR')}`,
        },
        {
          extend: 'pdf',
          text: 'PDF',
          className: 'buttons-pdf d-none',
          filename: () => {
            const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const month = this.selectedMonth ? monthNames[this.selectedMonth - 1] : monthNames[new Date().getMonth()];
            return `Movimientos de ${month}`;
          },
          orientation: 'landscape',
          exportOptions: {
            columns: ':visible'
          },
          title: `LISTADO MENSUAL DE INGRESOS/EGRESOS - 
                    Fecha de emisión ${new Date().toLocaleDateString('es-AR')}`,
        },
       
      ]
    });

    this.table.buttons().container().appendTo('#myTable_wrapper');

    this.table.on('draw', () => {
      const recordCount = this.table.rows({ filter: 'applied' }).count();
      this.exportButtonsEnabled = recordCount > 0;
      const buttons = ['#excelBtn', '#pdfBtn', '#printBtn'];
      buttons.forEach(btn => {
        $(btn).prop('disabled', !this.exportButtonsEnabled);
      });
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
        case 'dropdownDays':
          this.updateFilterSet('days', value, isChecked);
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
    $('#nombreIngresanteFilter, #documentoFilter, #propietarioFilter, #placaFilter').on('keyup', (e) => {
      const target = $(e.target);
      const inputValue = target.val() as string;

      if (inputValue.length < 3) {
        if (target.attr('id') === 'nombreIngresanteFilter') {
          this.filterValues.nombreIngresante = '';
        } else if (target.attr('id') === 'documentoFilter') {
          this.filterValues.documento = '';
        } else if (target.attr('id') === 'propietarioFilter') {
          this.filterValues.propietario = '';
        } else {
          this.filterValues.plate = '';
        }

        if (this.table) {
          this.table.draw();
        }
        return;
      }

      if (target.attr('id') === 'nombreIngresanteFilter') {
        this.filterValues.nombreIngresante = inputValue;
      } else if (target.attr('id') === 'documentoFilter') {
        this.filterValues.documento = inputValue;
      } else if (target.attr('id') === 'propietarioFilter') {
        this.filterValues.propietario = inputValue;
      } else {
        this.filterValues.plate = inputValue;
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
    const fecha = data[0];  // Nueva posición de fecha
    const hora = data[1];   // Nueva posición de hora
    const tipoEntrada = data[2];  // Nueva posición de tipo de entrada
    const tipoIngresante = data[3];
    const nombre = data[4];
    const documento = data[5];
    const tipoVehiculo = data[7];
    const placa = data[8];
    const propietario = data[9];
    const estadoHorario = data[11];

    if (this.filterValues.entryOrExit.size > 0 && 
        !Array.from(this.filterValues.entryOrExit).some(value => 
          tipoEntrada.toLowerCase() === this.entryOrExitMap[value])) {
      return false;
    }

    if (this.filterValues.tipoIngresante.size > 0 && 
        !Array.from(this.filterValues.tipoIngresante).some(value => 
          tipoIngresante.toLowerCase() === this.tipoIngresanteMap[value])) {
      return false;
    }

    if (this.filterValues.nombreIngresante && 
        !nombre.toLowerCase().includes(this.filterValues.nombreIngresante.toLowerCase())) {
      return false;
    }

    if (this.filterValues.documento && 
        !documento.toLowerCase().includes(this.filterValues.documento.toLowerCase())) {
      return false;
    }

    if (this.filterValues.typeCar.size > 0 && 
        !Array.from(this.filterValues.typeCar).some(value => 
          tipoVehiculo.toLowerCase() === this.typeCarMap[value])) {
      return false;
    }

    if (this.filterValues.propietario && 
        !propietario.toLowerCase().includes(this.filterValues.propietario.toLowerCase())) {
      return false;
    }

    if (this.filterValues.plate && 
        !placa.toLowerCase().includes(this.filterValues.plate.toLowerCase())) {
      return false;
    }

    if (this.filterValues.lateInRange.size > 0 && 
      !Array.from(this.filterValues.lateInRange).some(value => 
        estadoHorario.toLowerCase() === this.lateInRangeMap[value])) {
    return false;
  }

  if (this.filterValues.days.size > 0) {
    const dayFromDate = fecha.split('/')[0].replace(/^0+/, '');
    if (!Array.from(this.filterValues.days).some(value => 
        dayFromDate === value)) {
      return false;
    }
  }

  return true;
}

loadDataIntoTable(): void {
  if (this.table) {
    this.table.clear();

    if (Array.isArray(this.movements) && this.movements.length > 0) {
      this.movements.forEach(movement => {
        this.table.row.add([
          movement.day + '/' + movement.month + '/' + movement.year,  // Fecha
          movement.hour || '',                                        // Hora
          movement.entryOrExit || '',                                // Tipo de Entrada
          movement.entryType || '',                                  // Tipo de Ingresante
          movement.visitorName || '',                                // Nombre
          movement.visitorDocument || '',                            // Documento
          movement.observations || '',                               // Observaciones
          movement.carType || '',                                    // Tipo de Vehículo
          movement.plate || '',                                      // Placa
          movement.neighborId || '',                                 // Propietario
          'Garcia, ireneg',                                         // Guardia
          movement.lateOrNot || '',                                 // Estado de horario
        ]);
      });

      this.exportButtonsEnabled = true;
      ['#excelBtn', '#pdfBtn', '#printBtn'].forEach(btn => {
        $(btn).prop('disabled', false);
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: '¡No se encontraron registros!',
      });
      this.exportButtonsEnabled = false;
      ['#excelBtn', '#pdfBtn', '#printBtn'].forEach(btn => {
        $(btn).prop('disabled', true);
      });
    }

    this.table.draw();
  } else {
    this.initializeDataTable();
  }
}
}
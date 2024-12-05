import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { AccessUserReportService } from '../../../../services/access_report/access_httpclient/access_usersApi/access-user-report.service';
import { forkJoin, Observable, of, firstValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { FilterValues, Movement } from '../../../../models/access-report/Types';
import { DataTableConfigService } from '../../../../services/access_report/access_datatableconfig/data-table-config.service';

import {
  ENTRY_EXIT_OPTIONS,
  TIPOS_INGRESANTE,
  TIPOS_VEHICULO,
  USER_TYPE_MAPPINGS,
  VALUE_MAPPINGS,
} from '../../../../models/access-report/constants';
import { AccessRegistryUpdateService } from '../../../../services/access-registry-update/access-registry-update.service';
import { AccessVisitorRegistryComponent } from '../../../access_visitors/access-visitor-registry/access-visitor-registry.component';
import { AccessOwnerRenterserviceService } from '../../../../services/access-owner/access-owner-renterservice.service';
import {
  NgxScannerQrcodeComponent,
  NgxScannerQrcodeModule,
} from 'ngx-scanner-qrcode';
import { QRData } from '../../../../models/access-visitors/access-VisitorsModels';
import { MovementsService } from '../../../../services/access_report/access_httpclient/access_getMovementsByDate/movements.service';
import { Router } from '@angular/router';
import { RedirectInfo } from '../../../../models/access-metric/metris';

import $ from 'jquery';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../../common/services/tutorial.service';

@Component({
  selector: 'app-access-table',
  standalone: true,
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    AccessVisitorRegistryComponent,
    NgxScannerQrcodeModule,
    NgSelectModule,
  ],
  templateUrl: './access-table.component.html',
  styleUrls: ['./access-table.component.css'],
})
export class AccessTableComponent implements OnInit, AfterViewInit, OnDestroy {
  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  // Propiedades para manejo de fechas
  years: number[] = [];
  months: number[] = [];
  startDate: Date | null = null;
  endDate: Date | null = null;
  today: Date = new Date();

  // propiedad para trackear el filtro activo
  activeFilter: string | null = null;

  activeUserTypeFilters: Set<string> = new Set();

  // Propiedades para datos y tabla
  movements: Movement[] = [];
  table: any = null;
  exportButtonsEnabled: boolean = false;

  private readonly ownerService = inject(AccessOwnerRenterserviceService);
  private readonly router = inject(Router);

  redirectInfo: RedirectInfo = {
    data: this.router.getCurrentNavigation()?.extras?.state?.['data'],
    type: this.router.getCurrentNavigation()?.extras?.state?.['type'],
    startMonth:
      this.router.getCurrentNavigation()?.extras?.state?.['startMonth'],
    startYear: this.router.getCurrentNavigation()?.extras?.state?.['startYear'],
    endMonth: this.router.getCurrentNavigation()?.extras?.state?.['endMonth'],
    endYear: this.router.getCurrentNavigation()?.extras?.state?.['endYear'],
  };

  // Opciones para selectores
  propietariosOptions: any[] = [];
  guardiasOptions: any[] = [];

  // Importamos las opciones constantes desde el archivo de constantes
  entryExitOptions = ENTRY_EXIT_OPTIONS;
  tiposIngresante = TIPOS_INGRESANTE;
  tiposVehiculo = TIPOS_VEHICULO;

  // Estado inicial de los filtros
  filterValues: FilterValues = {
    entryOrExit: [],
    tipoIngresante: [],
    unifiedSearch: '',
    typeCar: [],
    selectedGuardia: [],
    selectedPropietario: [],
  };

  constructor(
    private http: HttpClient,
    private userService: AccessUserReportService,
    private dataTableConfig: DataTableConfigService,

    private movementsService: MovementsService,
    private tutorialService: TutorialService
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

    this.initializeDates();
  }

  @ViewChild('scanner') scanner!: NgxScannerQrcodeComponent; // Referencia al escáner QR

  isScanning: boolean = false; // Variable para controlar si el escáner está activo
  scannedResult: string = ''; // Resultado del QR escaneado

  // Activar el escáner y mostrar el modal
  ScanQR() {
    this.isScanning = true; // Activar el escáner
    this.startScanner(); // Iniciar el escáner
  }

  // Método para iniciar el escáner
  startScanner(): void {
    if (!this.scanner.isStart) {
      this.scanner.start();
    }
  }

  onModalOpened(): void {
    this.startScanner();
  }

  // Método para detener el escáner
  stopScanner(): void {
    if (this.scanner.isStart) {
      this.scanner.stop();
      this.isScanning = false;
    }
  }

  dataTable: any;
  users: any[] = [];

  handleQrScan(event: any): void {
    try {
      // Obtener el valor del QR escaneado
      this.scannedResult = event[0].value;

      // Parsear los datos del QR
      const qrData: QRData[] = JSON.parse(this.scannedResult);

      // Obtener todos los documentos únicos del QR
      const documents = new Set(qrData.map((item) => item.document));

      // Filtrar la DataTable
      const filteredDocumentsCount = this.filterTableByDocuments(
        Array.from(documents)
      );

      const filteredDocumentsCountSize = documents.size;

      // Verificar si se encontraron registros
      if (filteredDocumentsCount === 0) {
        Swal.fire({
          title: 'Usuario no encontrado',
          text: 'No se encontró ningún usuario registrado con los datos escaneados.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          showCancelButton: false,
          showCloseButton: true,
          confirmButtonColor: '#3085d6',
        });
      } else {
        Swal.fire({
          title: 'Éxito',
          text: `Se han filtrado ${filteredDocumentsCountSize} usuario(s).`,
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
      }

      // Detener el scanner
      this.stopScanner();
    } catch (error) {
      console.error('Error al procesar el QR:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El código QR no tiene un formato válido',
      });
    }
  }

  private filterTableByDocuments(documents: string[]): number {
    if (!this.table) return 0;

    // Guardar la función de búsqueda original
    const originalSearchFunction = $.fn.dataTable.ext.search.pop();

    // Agregar función de filtrado temporal
    $.fn.dataTable.ext.search.push((settings: any, data: string[]) => {
      // El documento está en la columna 5 (índice 5)
      const rowDocument = data[5];

      // Verificar si el documento de la fila está en la lista de documentos del QR
      const documentMatch = documents.some((doc) => rowDocument.includes(doc));

      // Si hay una función de búsqueda original, combinar los resultados
      if (originalSearchFunction) {
        return (
          documentMatch && originalSearchFunction(settings, data, undefined)
        );
      }

      return documentMatch;
    });

    // Redibujar la tabla con el filtro aplicado
    this.table.draw();

    // Obtener la cantidad de filas filtradas
    const filteredRows = this.table.rows({ search: 'applied' }).count();

    // Restaurar la función de búsqueda original después del filtrado
    $.fn.dataTable.ext.search.pop();
    if (originalSearchFunction) {
      $.fn.dataTable.ext.search.push(originalSearchFunction);
    }

    return filteredRows;
  }

  clearQRFilter(): void {
    if (!this.table) return;

    this.table.draw();
  }

  updateDataTable(filteredUsers: any[]): void {
    if (this.table) {
      this.table.clear(); // Limpiar la tabla actual
      if (filteredUsers.length > 0) {
        this.table.rows.add(filteredUsers); // Añadir los usuarios encontrados
      }
      this.table.draw(); // Redibujar la tabla
    }
  }

  /**
   * Inicializa las fechas por defecto (último mes)
   */
  private initializeDates(): void {
    const today = new Date();
    this.endDate = today;

    // Calcular la fecha de inicio (un mes antes)
    this.startDate = new Date(today.getFullYear(), 0, 1);
  }
  /**
   * Manejadores para los cambios de fecha
   */
  dateError: string = '';
  onStartDateChange(date: string): void {
    const selectedDate = new Date(date);

    // Validar que la fecha no sea mayor que hoy
    if (selectedDate > this.today) {
      this.startDate = this.today;
      this.dateError = 'La fecha desde no puede ser mayor a la fecha actual';
      return;
    }

    // Validar que la fecha desde no sea mayor que la fecha hasta
    if (this.endDate && selectedDate > this.endDate) {
      this.startDate = this.endDate;
      this.dateError = 'La fecha desde no puede ser mayor a la fecha hasta';
      return;
    }

    this.dateError = ''; // Limpiar error si todo está bien
    this.startDate = selectedDate;
    this.fetchData();
  }

  onEndDateChange(date: string): void {
    const selectedDate = new Date(date);

    // Validar que la fecha no sea mayor que hoy
    if (selectedDate > this.today) {
      this.endDate = this.today;
      this.dateError = 'La fecha hasta no puede ser mayor a la fecha actual';
      return;
    }

    // Validar que la fecha hasta no sea menor que la fecha desde
    if (this.startDate && selectedDate < this.startDate) {
      this.endDate = this.startDate;
      this.dateError = 'La fecha hasta no puede ser menor a la fecha desde';
      return;
    }

    this.dateError = ''; // Limpiar error si todo está bien
    this.endDate = selectedDate;
    this.fetchData();
  }

  toggleUserTypeFilter(userType: string): void {
    if (this.activeUserTypeFilters.has(userType)) {
      this.activeUserTypeFilters.delete(userType);
    } else {
      this.activeUserTypeFilters.add(userType);
    }

    // Actualizar los filtros usando el nuevo mapeo
    this.filterValues.tipoIngresante = Array.from(this.activeUserTypeFilters)
      .map((type) => USER_TYPE_MAPPINGS[type]?.filterValue)
      .filter((v) => v);

    if (this.table) {
      this.table.draw();
    }
  }

  // Método para verificar si un botón está activo
  isUserTypeFilterActive(userType: string): boolean {
    return this.activeUserTypeFilters.has(userType);
  }

  private readonly registryUpdate = inject(AccessRegistryUpdateService);

  /**
   * Inicialización del componente
   * Carga las opciones de los selectores y obtiene los datos iniciales
   */
  ngOnInit(): void {
    //TUTORIAL
    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );

    window.addEventListener('openModalInfo', this.handleOpenModal);
    window.addEventListener('Movment', this.handleOpenMovement);
    if (this.redirectInfo.startMonth && this.redirectInfo.startYear) {
      this.startDate = new Date(
        this.redirectInfo.startYear,
        this.redirectInfo.startMonth - 1,
        1,
        0,
        0,
        0,
        0
      );
    }
    if (this.redirectInfo.endMonth && this.redirectInfo.endYear) {
      this.endDate = new Date(
        this.redirectInfo.endYear,
        this.redirectInfo.endMonth,
        0,
        23,
        59,
        59,
        999
      );
    }
  }

  /**
   * Se manda el documento al servicio
   */
  private handleOpenModal = (event: Event) => {
    const customEvent = event as CustomEvent;
    const visitorDocument = customEvent.detail;
    this.ownerService.openModal(visitorDocument);
  };
  private handleOpenMovement = (event: Event) => {
    const customEvent = event as CustomEvent;
    const { document, type, plate } = customEvent.detail;
    this.ownerService.onMOvement(document, type, plate);
  };

  /**
   * Carga las opciones para los selectores de propietarios y guardias
   * desde el servicio
   */
  private loadSelectOptions(): void {
    this.userService.getPropietariosForSelect().subscribe((options) => {
      this.propietariosOptions = options;
      this.applyRedirectFilters();
    });

    this.userService.getGuardiasForSelect().subscribe((options) => {
      this.guardiasOptions = options;
      this.applyRedirectFilters();
    });
  }

  applyRedirectFilters() {
    if (this.redirectInfo.data && this.redirectInfo.type) {
      if (
        this.redirectInfo.type === 'guardEntries' &&
        this.redirectInfo.data.id
      ) {
        this.filterValues.entryOrExit = ['entrada'];
        this.filterValues.selectedGuardia = [this.redirectInfo.data.id];
      } else if (
        this.redirectInfo.type === 'guardExits' &&
        this.redirectInfo.data.id
      ) {
        this.filterValues.entryOrExit = ['salida'];
        this.filterValues.selectedGuardia = [this.redirectInfo.data.id];
      } else if (
        this.redirectInfo.type === 'neighborAuthorizations' &&
        this.redirectInfo.data.id
      ) {
        this.filterValues.selectedPropietario = [this.redirectInfo.data.id];
      }
      this.applyFilters();
    }
  }

  /**
   * Obtiene los datos del servidor
   * Realiza la petición HTTP y maneja los errores
   */
  fetchData(): void {
    if (!this.startDate || !this.endDate) return;

    this.movementsService
      .getMovementsByDateRange(this.startDate, this.endDate)
      .subscribe((response) => {
        this.movements = response.data;
        this.loadDataIntoTable();
      });
  }
  /**
   * Carga los datos en la tabla DataTable
   * Procesa los movimientos y actualiza la visualización
   */
  private async loadDataIntoTable(): Promise<void> {
    if (!this.table) return;

    this.table.clear();

    await this.userService.ensureCacheInitialized();
    const processedRows = await this.processMovements();

    processedRows.forEach((row) => {
      this.table.row.add(row);
    });

    this.enableExportButtons();
    this.table.draw();
  }

  /**
   * Habilita los botones de exportación y actualiza el estado del flag
   */
  private enableExportButtons(): void {
    this.exportButtonsEnabled = true;
    ['#excelBtn', '#pdfBtn'].forEach((btn) => {
      $(btn).prop('disabled', false);
    });
  }

  /**
   * Deshabilita los botones de exportación y actualiza el estado del flag
   */
  private disableExportButtons(): void {
    this.exportButtonsEnabled = false;
    ['#excelBtn', '#pdfBtn'].forEach((btn) => {
      $(btn).prop('disabled', true);
    });
  }

  /**
   * Procesa todos los movimientos para mostrarlos en la tabla
   */
  private async processMovements(): Promise<string[][]> {
    const processedMovements = this.movements.map((movement) =>
      this.processMovement(movement)
    );
    return Promise.all(processedMovements);
  }

  /**
   * Procesa un movimiento individual
   * Transforma los datos para su visualización
   */
  private async processMovement(movement: Movement): Promise<string[]> {
    try {
      const transformations: Observable<string>[] = [
        of(movement.day + '/' + movement.month + '/' + movement.year),
        of(movement.hour || ''),
        of((movement.entryOrExit || '') + '!-' + movement.isLastMovement),
        of(movement.entryType || ''),
        this.userService.transformNameOrId(movement.visitorName || ''),
        of(movement.visitorDocument || ''),
        of(movement.carType || ''),
        of(movement.plate || ''),

        // Manejo de condiciones para neighborId
        movement.neighborId === 'null'
          ? of('------')
          : /^\d+$/.test(movement.neighborId) // Si es un número en tipo string
          ? this.userService.getUserById(parseInt(movement.neighborId, 10)) // Parsear a número
          : of(movement.neighborId || ''), // Si es una cadena de texto

        this.userService.getUserById(movement.securityId),
      ];

      return await firstValueFrom(forkJoin(transformations));
    } catch {
      return this.getErrorRow(movement);
    }
  }

  /**
   * Devuelve una fila con datos de error cuando falla el procesamiento
   */
  private getErrorRow(movement: Movement): string[] {
    return [
      movement.day + '/' + movement.month + '/' + movement.year,
      movement.hour || '',
      movement.entryOrExit || '',
      movement.entryType || '',
      movement.visitorName || '',
      movement.visitorDocument || '',
      movement.carType || '',
      movement.plate || '',
      '------',
      'Error de conexión',
    ];
  }

  /**
   * Inicializa la tabla DataTable con su configuración
   */
  private initializeDataTable(): void {
    const config = {
      ...this.dataTableConfig.getBaseConfig(),
    };

    this.table = ($('#myTable') as any).DataTable(config);
  }

  getUserTypeColor(type: string): string {
    const typeConfig =
      this.dataTableConfig.USER_TYPE_ICONS[
        type as keyof typeof this.dataTableConfig.USER_TYPE_ICONS
      ];
    return typeConfig ? typeConfig.color : 'grey';
  }

  getUserTypeIcon(type: string): string {
    const typeConfig =
      this.dataTableConfig.USER_TYPE_ICONS[
        type as keyof typeof this.dataTableConfig.USER_TYPE_ICONS
      ];
    return typeConfig ? typeConfig.icon : 'bi bi-question-lg';
  }

  /**
   * Maneja el evento de redibujado de la tabla
   * Aplica estilos a las celdas
   */
  private handleDrawCallback(settings: any): void {
    setTimeout(() => {
      this.styleEntryExitColumn();
    });
  }

  /**
   * Aplica estilos a la columna de entrada/salida
   */
  private styleEntryExitColumn(): void {
    $(this.table.table().node())
      .find('td:nth-child(3)')
      .each(function () {
        const cellText = $(this).text().trim().toLowerCase();
        const color = cellText === 'entrada' ? '#28a745' : '#dc3545';
        if (['entrada', 'salida'].includes(cellText)) {
          $(this).html(`
          <div class="d-flex justify-content-center">
            <span class="badge rounded-pill d-flex align-items-center justify-content-center" 
                  style="background-color: ${color}; color: white; border: none;">
              ${cellText.charAt(0).toUpperCase() + cellText.slice(1)}
            </span>
          </div>
        `);
        }
      });
  }

  /**
   * Limpieza al destruir el componente
   */
  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
      while ($.fn.dataTable.ext.search.length > 0) {
        $.fn.dataTable.ext.search.pop();
      }
    }
    $('#excelBtn, #pdfBtn').off('click');

    //TUTORIAL
    this.tutorialSubscription.unsubscribe();
    if (this.tour) {
      this.tour.complete();
    }

    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }

  /**
   * Método del ciclo de vida que se ejecuta después de que la vista se ha inicializado
   * Inicializa la tabla y configura los filtros
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDataTable();
      this.setupFilters();
      this.registryUpdate.getObservable().subscribe(() => {
        this.loadSelectOptions();
        this.fetchData();
      });
    });
  }

  /**
   * Configura los filtros de la tabla
   */
  private setupFilters(): void {
    this.setupUnifiedSearchFilter();
    this.setupCustomFilters();
  }

  /**
   * Configura el filtro de búsqueda unificada
   */
  private setupUnifiedSearchFilter(): void {
    $('#unifiedSearchFilter').on('keyup', (e) => {
      const target = $(e.target);
      const inputValue = target.val() as string;

      this.filterValues.unifiedSearch =
        inputValue.length >= 3 ? inputValue : '';

      if (this.table) {
        this.table.draw();
      }
    });
  }

  /**
   * Configura los filtros personalizados de la tabla
   */
  private setupCustomFilters(): void {
    $.fn.dataTable.ext.search.push((settings: any, data: string[]) =>
      this.filterRow(data)
    );
  }

  /**
   * Filtra una fila de datos según los criterios establecidos
   */
  private filterRow(data: string[]): boolean {
    const [
      fecha,
      ,
      tipoEntrada,
      tipoIngresante,
      nombre,
      documento,
      tipoVehiculo,
      placa,
      propietario,
      guardia,
    ] = data;
    // Búsqueda unificada
    if (this.filterValues.unifiedSearch) {
      const searchTerm = this.filterValues.unifiedSearch.toLowerCase();
      const searchFields = [nombre, documento, placa];
      if (
        !searchFields.some((field) => field.toLowerCase().includes(searchTerm))
      ) {
        return false;
      }
    }

    // Verificar filtro de entrada/salida
    if (this.filterValues.entryOrExit.length > 0) {
      if (
        !this.filterValues.entryOrExit.some((value) => {
          return (
            tipoEntrada.trim().toLowerCase() ===
            VALUE_MAPPINGS[value].toLowerCase()
          );
        })
      ) {
        return false;
      }
    }

    // Verificar filtros de tipo de usuario si hay alguno activo
    if (this.filterValues.tipoIngresante.length > 0) {
      const normalizedTipoIngresante = tipoIngresante.toLowerCase().trim();

      const matchesTipo = this.filterValues.tipoIngresante.some(
        (filterValue) => {
          // Encontrar el tipo de usuario que corresponde a este filterValue
          const matchingType = Object.values(USER_TYPE_MAPPINGS).find(
            (mapping) => mapping.filterValue === filterValue
          );

          if (matchingType) {
            // Comparar con el valor de la columna, normalizando ambos valores
            return (
              normalizedTipoIngresante ===
              matchingType.columnValue.toLowerCase().trim()
            );
          }
          return false;
        }
      );

      if (!matchesTipo) return false;
    }

    if (this.filterValues.typeCar.length > 0) {
      if (
        !this.filterValues.typeCar.some(
          (value) =>
            tipoVehiculo.toLowerCase() === VALUE_MAPPINGS[value].toLowerCase()
        )
      ) {
        return false;
      }
    }

    // Verificar filtro de propietario
    if (this.filterValues.selectedPropietario.length > 0) {
      const propietarioMatches = this.filterValues.selectedPropietario.some(
        (selectedId) => {
          const propietarioOption = this.propietariosOptions.find(
            (p) => p.id === selectedId
          );
          return (
            propietarioOption &&
            propietario
              .toLowerCase()
              .includes(propietarioOption.label.toLowerCase())
          );
        }
      );
      if (!propietarioMatches) return false;
    }

    // Verificar filtro de guardia
    if (this.filterValues.selectedGuardia.length > 0) {
      const guardiaMatches = this.filterValues.selectedGuardia.some(
        (selectedId) => {
          const guardiaOption = this.guardiasOptions.find(
            (g) => g.id === selectedId
          );
          return (
            guardiaOption &&
            guardia.toLowerCase().includes(guardiaOption.label.toLowerCase())
          );
        }
      );
      if (!guardiaMatches) return false;
    }

    return true;
  }

  /**
   * Aplica los filtros seleccionados a la tabla
   * Este método es llamado cuando cambia cualquier filtro
   */
  applyFilters(): void {
    if (this.table) {
      this.table.draw();
    }
  }
  /**
   * Exporta los datos de la tabla a PDF usando jsPDF
   */
  exportToPDF(): void {
    // Crear nueva instancia de jsPDF
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Configurar el título
    const title = 'Reporte de Accesos';
    const subtitle = `Período: ${this.formatDate(
      this.startDate
    )} - ${this.formatDate(this.endDate)}`;

    doc.setFontSize(18);
    doc.text(title, 15, 15);
    doc.setFontSize(12);
    doc.text(subtitle, 15, 25);

    // Obtener los datos filtrados de la tabla
    const filteredData = this.table
      .rows({ search: 'applied' })
      .data()
      .toArray()
      .map((row: any[]) => {
        return [
          row[0], // Fecha
          row[1], // Hora
          row[2].split('!-')[0], // Tipo
          row[3], // Ingresante
          row[4], // Nombre
          row[5], // Documento
          row[6], // Vehículo
          row[7], // Placa
          row[8], // Propietario
          row[9], // Guardia
        ];
      });

    autoTable(doc, {
      head: [
        [
          'Fecha',
          'Hora',
          'Tipo',
          'Ingresante',
          'Nombre',
          'Documento',
          'Vehículo',
          'Placa',
          'Propietario',
          'Guardia',
        ],
      ],
      body: filteredData,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap',
      },
      headStyles: {
        fillColor: [0, 196, 166],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        overflow: 'linebreak',
      },
      margin: { top: 35, bottom: 20, left: 15, right: 15 },
      didDrawCell: (data) => {
        // Asegurarse de que las columnas de nombre y propietario no tengan saltos de línea
        if (data.column.index === 4 || data.column.index === 8) {
          data.cell.styles.overflow = 'hidden';
          data.cell.styles.cellWidth = 'auto';
        }
      },
    });

    // Agregar pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount} - Generado el ${new Date().toLocaleString()}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Guardar el PDF
    doc.save(
      `Reporte_Accesos_${this.formatDate(this.startDate)}_${this.formatDate(
        this.endDate
      )}.pdf`
    );
  }
  /**
   * Exporta los datos de la tabla a Excel de forma simplificada
   */
  exportToExcel(): void {
    // Crear el encabezado
    const encabezado = [
      ['Reporte de Accesos'],
      [
        `Fechas: Desde ${this.formatDate(
          this.startDate
        )} hasta ${this.formatDate(this.endDate)}`,
      ],
      [],
      [
        'Fecha',
        'Hora',
        'Tipo',
        'Ingresante',
        'Nombre',
        'Documento',
        'Vehículo',
        'Placa',
        'Propietario',
        'Guardia',
      ],
    ];

    // Obtener datos filtrados de la tabla
    const datos = this.table
      .rows({ search: 'applied' })
      .data()
      .toArray()
      .map((row: any[]) => {
        return [
          row[0], // Fecha
          row[1], // Hora
          row[2].split('!-')[0], // Tipo
          row[3], // Ingresante
          row[4], // Nombre
          row[5], // Documento
          row[6], // Vehículo
          row[7], // Placa
          row[8], // Propietario
          row[9], // Guardia
        ];
      });

    // Combinar encabezado y datos
    const worksheetData = [...encabezado, ...datos];

    // Crear la hoja de cálculo
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Configurar anchos de columna
    worksheet['!cols'] = [
      { wch: 12 }, // Fecha
      { wch: 10 }, // Hora
      { wch: 10 }, // Tipo
      { wch: 15 }, // Ingresante
      { wch: 25 }, // Nombre
      { wch: 15 }, // Documento
      { wch: 12 }, // Vehículo
      { wch: 12 }, // Placa
      { wch: 25 }, // Propietario
      { wch: 25 }, // Guardia
    ];

    // Crear y guardar el libro
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte de Accesos');

    // Guardar archivo
    XLSX.writeFile(
      workbook,
      `reporte_accesos_${this.formatDate(this.startDate)}_${this.formatDate(
        this.endDate
      )}.xlsx`
    );
  }

  private formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Limpia todos los filtros aplicados
   * Reinicia los valores y actualiza la tabla
   */
  clearFilters(): void {
    // Reiniciar todos los valores de filtro
    this.activeFilter = null;
    this.redirectInfo = {
      data: null,
      type: null,
      startMonth: null,
      startYear: null,
      endMonth: null,
      endYear: null,
    };
    this.activeUserTypeFilters.clear();
    this.filterValues = {
      entryOrExit: [],
      tipoIngresante: [],
      unifiedSearch: '',
      typeCar: [],
      selectedGuardia: [],
      selectedPropietario: [],
    };
    this.initializeDates();
    this.fetchData();

    // Limpiar el campo de búsqueda unificada
    $('#unifiedSearchFilter').val('');

    // Redibujar la tabla con los filtros limpios
    if (this.table) {
      this.table.draw();
    }
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
      id: 'table-step',
      title: 'Tabla de Accesos',
      text: 'Acá puede ver el listado de accesos ordenados por fecha y hora. También se diferencia por tipo de visitante, qué guardia lo autorizó y, si entró con vehículo, los datos del mismo.',
      attachTo: {
        element: '#myTable',
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
      id: 'subject-step',
      title: 'Filtros',
      text: 'Desde acá podrá filtrar los ingresos por fecha, buscarlos manualmente, o acceder a una pantalla con filtros más específicos.',
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
      id: "type-step",
      title: 'Botones de acción',
      text: 'Con estos botones puede filtrar los accesos por tipo de forma más accesible. También puede ver la lista de personas autorizadas o escanear los QR de acceso. De ser necesario, también puede exportar la lista a Excel o PDF.',

      attachTo: {
        element: '#tipos',
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
    
    this.tour.addStep({
      id: "type-step",
      title: 'Emergencias',
      text: 'En caso de emergencias, puede permitir acceso de forma más rápida a través de esta pantalla.',

      attachTo: {
        element: '#emergency',
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
}

/**
 * Interface para los valores de los filtros de la tabla
 */
export interface FilterValues {
    entryOrExit: string[];          // Filtro de entrada/salida
    tipoIngresante: string[];       // Tipo de persona que ingresa
    unifiedSearch: string;          // Búsqueda unificada
    typeCar: string[];             // Tipo de vehículo
                                  // Estado del horario
                        // Días seleccionados
    selectedGuardia: number[];     // IDs de guardias seleccionados
    selectedPropietario: number[]; // IDs de propietarios seleccionados
  }
  
  /**
   * Interface para las opciones de los selectores
   */
  export interface SelectOption {
    value: string;
    label: string;
  }
  
  /**
   * Interface para los datos de movimiento
   */
  export interface Movement {
    day: string;
    month: string;
    year: string;
    hour: string;
    entryOrExit: string;
    entryType: string;
    visitorName: string;
    visitorDocument: string;
    observations: string;
    carType: string;
    plate: string;
    neighborId: string;
    securityId: number;
    lateOrNot: string;
    isLastMovement : boolean;
  }
  
  /**
   * Interface para la configuración de DataTables
   */
  export interface DataTableConfig {
    paging: boolean;
    ordering: boolean;
    pageLength: number;
    lengthMenu: number[][];
    scrollX: boolean;
    lengthChange: boolean;
    orderCellsTop: boolean;
    order: any[];
    columnDefs: ColumnDef[];
    searching: boolean;
    info: boolean;
    autoWidth: boolean;
    language: LanguageConfig;
    responsive: boolean;
    dom: string;
    drawCallback?: (settings: any) => void;
  }
  
  /**
   * Interface para la definición de columnas de DataTables
   */
  export interface ColumnDef {
    targets: number;
    className?: string;
    render?: (data: any, type?: any, row?: any) => string;
  }
  
  /**
   * Interface para la configuración de idioma de DataTables
   */
  export interface LanguageConfig {
    lengthMenu: string;
    zeroRecords: string;
    info: string;
    infoEmpty: string;
    infoFiltered: string;
    search: string;
    emptyTable: string;
  }
  
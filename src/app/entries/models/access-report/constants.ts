
import { ColumnDef, LanguageConfig, SelectOption } from './Types';


  interface UserTypeMapping {
  icon: string;
  color: string;
  title: string;
  filterValue: string; // Valor usado en el filtro
  columnValue: string; // Valor que aparece en la columna de la tabla
}

      /**
   * Configuración de iconos para tipos de usuario
   */
      export const USER_TYPE_MAPPINGS: { [key: string]: UserTypeMapping } = {
        Empleado: {
          icon: 'bi bi-briefcase text-dark', 
          color: '#FFDAB9 ',
          title: 'Empleado',
          filterValue: 'employee',
          columnValue: 'empleado'
        },
        Proveedor: {
          icon: 'bi bi-truck text-dark',
          color: '#FFCECE  ',
          title: 'Proveedor',
          filterValue: 'suplier',
          columnValue: 'proveedor'
        },
        Visitante: {
          icon: 'bi bi-person-raised-hand text-dark',
          color: '#B0E0E6  ',
          title: 'Visitante',
          filterValue: 'visitor',
          columnValue: 'visitante'
        },
        Vecino: {
          icon: 'bi-house text-dark',
          color: '#9FD8AB  ',
          title: 'Vecino',
          filterValue: 'neighbour',
          columnValue: 'vecino'
        },
        Obrero: {
          icon: 'bi bi-tools text-dark',
          color: '#FFB0B0',
          title: 'Obrero',
          filterValue: 'worker',
          columnValue: 'Obrero'
        },
        Delivery: {
          icon: 'bi bi-box-seam text-dark',
          color: '#FFB0B0',
          title: 'Delivery',
          filterValue: 'delivery',
          columnValue: 'delivery'
        },
        Cleaning: {
          icon: 'bi-droplet text-dark',
          color: '#FFB0B0',
          title: 'P. de Limpieza',
          filterValue: 'cleaning',
          columnValue: 'P. de Limpieza'
        },
        Gardener: {
          icon: 'bi-scissors text-dark',
          color: '#FFB0B0',
          title: 'Jardinero',
          filterValue: 'gardener',
          columnValue: 'jardinero'
        },        
        Taxi: {
          icon: 'bi bi-taxi-front-fill text-dark',
          color: '#FFB0B0',
          title: 'Taxi',
          filterValue: 'taxi',
          columnValue: 'taxi'
        },
        Emergencias: {
          icon: 'bi bi-hospital',
          color: '#dc3545',
          title: 'Emergencias',
          filterValue: 'services',
          columnValue: 'Emergencias'
        }
      };
/**
 * Opciones para el selector de entrada/salida
 */
export const ENTRY_EXIT_OPTIONS: SelectOption[] = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'salida', label: 'Salida' }
];

/**
 * Opciones para el tipo de persona que ingresa
 */
export const TIPOS_INGRESANTE: SelectOption[] = [


  { value: 'delivery', label: 'Delivery' },
  { value: 'worker', label: 'Obrero' },
  { value: 'services', label: 'Emergencias' },
   { value: 'taxi', label: 'Taxi'},
  { value: 'cleaning', label: 'P. de Limpieza' },
  { value: 'gardener', label: 'Jardinero' }
];

export const TIPOS_INGRESANTE_DASHBOARD: SelectOption[] = [


  { value: 'delivery', label: 'Delivery' },
  { value: 'worker', label: 'Obrero' },
  { value: 'services', label: 'Emergencias' },
  { value: 'taxi', label: 'Taxi'},
  { value: 'neighbour', label: 'Vecino' },
  { value: 'visitor', label: 'Visitante' },
  { value: 'employee', label: 'Empleado' },
  { value: 'suplier', label: 'Proveedor' },
  { value: 'cleaning', label: 'P. de Limpieza' },
  { value: 'gardener', label: 'Jardinero' }
];


/**
 * Opciones para el tipo de vehículo
 */
export const TIPOS_VEHICULO: SelectOption[] = [
  { value: 'car', label: 'Auto' },
  { value: 'motorcycle', label: 'Moto' },
  { value: 'truck', label: 'Camión' },
  { value: 'bike', label: 'Bicicleta' },
  { value: 'van', label: 'Camioneta' },
  { value: 'walk', label: 'Sin vehículo' }
];

/**
 * Opciones para el estado del horario
 */
export const ESTADO_HORARIO_OPTIONS: SelectOption[] = [
  { value: 'inrange', label: 'En horario' },
  { value: 'late', label: 'Tarde' }
];

/**
 * Mapeo de valores para las transformaciones
 */
export const VALUE_MAPPINGS: { [key: string]: string } = {
  // Entrada/Salida
  entrada: 'entrada',
  salida: 'salida',
  
  // Tipos de ingresante
  neighbour: 'vecino',
  visitor: 'visitante',
  delivery: 'delivery',
  worker: 'obrero',
  suplier: 'proveedor',
  employee: 'empleado',
  services: 'servicios',
  
  // Tipos de vehículo
  car: 'auto',
  motorcycle: 'moto',
  truck: 'camion',
  bike: 'bicicleta',
  van: 'camioneta',
  walk: 'sin vehículo',
  
  // Estados de horario
  inrange: 'en horario',
  late: 'tarde'
};

/**
 * Configuración por defecto para el idioma de DataTables
 */
export const DEFAULT_LANGUAGE_CONFIG: LanguageConfig = {
  lengthMenu: " _MENU_ ",
  zeroRecords: "No se encontraron registros",
  info: "",
  infoEmpty: "",
  infoFiltered: "",
  search: "Buscar:",
  emptyTable: "No se encontraron resultados"
};

/**
 * Configuración por defecto para las columnas de la tabla
 */
export const DEFAULT_COLUMN_DEFS: ColumnDef[] = [

    
  { 
    targets: 11,
    className: 'text-center'
  },
  {
    targets: 9,
    render: (data: any) => {
      return data === '------' ? '<div class="text-center">------</div>' : data;
    }
  }
];

/**
 * Configuración de estilo para los badges
 */
export const BADGE_STYLES = {
  entry: {
    success: '#28a745',
    error: '#dc3545'
  },
  text: {
    light: 'white'
  }
};

  /**
   * Estilos predefinidos para los estados de horario
   */
  export const STATUS_STYLES = {
    late: {
      color: '#dc3545',  // Rojo para tarde
      text: 'Tarde'
    },
    inrange: {
      color: '#28a745',  // Verde para en horario
      text: 'En Horario'
    }
  };


  /**
   * Estilos predefinidos para los tipos de entrada/salida
   */
  export const ENTRY_STYLES = {
    entrada: {
      color: '#28a745',  // Verde para entrada
      text: 'Entrada'
    },
    salida: {
      color: '#dc3545',  // Rojo para salida
      text: 'Salida'
    }
  };
  
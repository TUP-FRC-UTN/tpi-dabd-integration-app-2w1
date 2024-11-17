import { Injectable } from '@angular/core';
import $ from 'jquery';
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import 'jszip';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  /**
   * Configura los botones de exportación para la tabla
   */
  setupExportButtons(table: any, startDate: Date | null, endDate: Date | null): void {
    const { formattedDateRange, formattedDateForFilename } = this.getFormattedDateRange(startDate, endDate);
    
    // Limpiar botones existentes si los hay
    if (table.buttons) {

    }

    // Configurar nuevos botones
    const buttonsConfig = {
      buttons: [
        {
          ...this.getExcelConfig(formattedDateForFilename, formattedDateRange),
          className: 'dt-button-excel d-none'
        },
        {
          ...this.getPdfConfig(formattedDateForFilename, formattedDateRange),
          className: 'dt-button-pdf d-none'
        }
      ]
    };

    // Crear y agregar los botones
    const buttons = new ($.fn.dataTable.Buttons as any)(table, buttonsConfig);
    const $container = $(buttons.container());
    $container.appendTo('#myTable_wrapper');
    
    // Guardar referencia a los botones
    table.buttons = buttons;
  }

  /**
   * Obtiene las fechas formateadas para el rango
   */
  private getFormattedDateRange(startDate: Date | null, endDate: Date | null): { 
    formattedDateRange: string, 
    formattedDateForFilename: string 
  } {
    if (!startDate || !endDate) {
      return {
        formattedDateRange: 'Sin fecha específica',
        formattedDateForFilename: 'sin_fecha'
      };
    }

    const formatDate = (date: Date): string => {
      return [
        date.getDate().toString().padStart(2, '0'),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getFullYear()
      ].join('/');
    };

    const formatDateForFilename = (date: Date): string => {
      return [
        date.getDate().toString().padStart(2, '0'),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getFullYear()
      ].join('_');
    };

    return {
      formattedDateRange: `${formatDate(startDate)} al ${formatDate(endDate)}`,
      formattedDateForFilename: `${formatDateForFilename(startDate)}_al_${formatDateForFilename(endDate)}`
    };
  }

  /**
   * Obtiene la configuración para exportación a Excel
   */
  private getExcelConfig(formattedDateForFilename: string, dateRange: string) {
    return {
      extend: 'excel',
      text: 'Excel',
      filename: () => `Reporte_Accesos_${formattedDateForFilename}`,
      exportOptions: {
        columns: ':visible',
        format: {
          body: (data: any, row: number, column: number) => {
            // Convertir a string y eliminar espacios en blanco
            const strData = String(data).trim();
            
            // Para la columna de tipo de ingresante
            if (column === 3) {
              const titleMatch = strData.match(/title="([^"]+)"/);
              if (titleMatch && titleMatch[1]) {
                return titleMatch[1];
              }
              return 'Desconocido';
            }
            
            if (column === 2) {
              const titleMatch = strData.match(/data-title="([^"]+)"/);
              if (titleMatch && titleMatch[1]) {
                return titleMatch[1];
              }
              return 'Desconocido';
            }
            
          // Para la columna con los guiones
          if (column === 8) {
            // Si incluye el div con clase text-center
            if (strData.includes('text-column-8')) {
              return '------';
            }
            // Si es directamente los guiones
            if (strData === '------') {
              return '------';
            }
            // Para cualquier otro caso, retornar el dato original
            return strData;
          }
          
            // Para cualquier otra columna, retornar el dato sin modificar
            return strData;
          }
        }
      },
      messageTop: `Reporte de movimientos del ${dateRange}\nFecha de emisión: ${new Date().toLocaleDateString()}`,
      title: 'LISTADO DE INGRESOS/EGRESOS',
      customize: (xlsx: any) => {
        const sheet = xlsx.xl.worksheets['sheet1.xml'];
        $('row:first c', sheet).attr('s', '48');
        $('row c[r^="A1"]', sheet).attr('s', '51');
      }
    };
  }

  /**
   * Obtiene la configuración para exportación a PDF
   */
  private getPdfConfig(formattedDateForFilename: string, dateRange: string) {
    return {
      extend: 'pdf',
      text: 'PDF',
      filename: () => `Reporte_Accesos_${formattedDateForFilename}`,
      orientation: 'landscape',
      pageSize: 'A4',
      exportOptions: {
        columns: ':visible',
        format: {
          body: (data: any, row: number, column: number) => {
            // Convertir a string y eliminar espacios en blanco
            const strData = String(data).trim();
            
            // Para la columna de tipo de ingresante
            if (column === 3) {
              const titleMatch = strData.match(/title="([^"]+)"/);
              if (titleMatch && titleMatch[1]) {
                return titleMatch[1];
              }
              return 'Desconocido';
            }

            if (column === 2) {
              const titleMatch = strData.match(/data-title="([^"]+)"/);
              if (titleMatch && titleMatch[1]) {
                return titleMatch[1];
              }
              return 'Desconocido';
            }

            // Para la columna con los guiones
            if (column === 8) {
              // Si incluye el div con clase text-center
              if (strData.includes('text-column-8')) {
                return '------';
              }
              // Si es directamente los guiones
              if (strData === '------') {
                return '------';
              }
              // Para cualquier otro caso, retornar el dato original
              return strData;
            }

            // Para cualquier otra columna, retornar el dato sin modificar
            return strData;
          }
        }
      },
      customize: (doc: any) => {
        // Estilo para la tabla
        doc.content[1].table.headerRows = 1;
        doc.content[1].table.body[0].forEach((cell: any) => {
          cell.fillColor = '#25B79D';
          cell.color = '#FFFFFF';
        });

        // Ajustar los anchos de las columnas actualizados para 10 columnas
        doc.content[1].table.widths = [
          'auto',  // Fecha
          'auto',  // Hora
          'auto',  // Tipo
          'auto',  // Ingresante
          100,      // Nombre
          100,     // Documento
          'auto',  // Vehículo
          'auto',  // Placa
          'auto',  // Propietario
          'auto'   // Guardia
        ];

        // Título principal
        doc.content[0] = {
          text: 'LISTADO DE INGRESOS/EGRESOS',
          alignment: 'left',
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 10]
        };

        // Subtítulo con el rango de fechas
        doc.content.splice(1, 0, {
          text: `Reporte de movimientos del: ${dateRange}`,
          alignment: 'left',
          fontSize: 12,
          margin: [0, 0, 0, 5]
        });
      },
      title: 'LISTADO DE INGRESOS/EGRESOS'
    };
  }
}
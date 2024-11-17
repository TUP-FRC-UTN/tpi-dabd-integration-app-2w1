// services/datatable-config.service.ts

import { Injectable } from "@angular/core";
import { ENTRY_STYLES, STATUS_STYLES, USER_TYPE_MAPPINGS } from "../../../models/access-report/constants";
import { DataTableConfig } from "../../../models/access-report/Types";

@Injectable({
  providedIn: 'root'
})
export class DataTableConfigService {
  
  public readonly USER_TYPE_ICONS = USER_TYPE_MAPPINGS;
  public readonly STATUS_STYLES = STATUS_STYLES;

  
  
    /**
     * Retorna la configuración base para la tabla DataTable
     */
    getBaseConfig(): DataTableConfig {
      return {
        paging: true,
        ordering: true,
        pageLength: 5,
        lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
        scrollX: true,
        lengthChange: true,
        orderCellsTop: true,
        order: [],
        columnDefs: this.getColumnDefs(),
        searching: true,
        info: true,
        autoWidth: false,
        language: this.getLanguageConfig(),
        responsive: true,
        dom: 'rt<"bottom d-flex justify-content-between align-items-center"<"d-flex align-items-center gap-3"l i> p><"clear">'
      };
    }
  
    /**
     * Retorna la configuración de idioma para la tabla
     */
    private getLanguageConfig() {
      return {
        lengthMenu: " _MENU_ ",
        zeroRecords: "No se encontraron registros",
        info: "",
        infoEmpty: "",
        infoFiltered: "",
        search: "Buscar:",
        emptyTable: "No se encontraron resultados"
      };
    }
  
    private getColumnDefs() {
      return [    
        {
          targets: 8,
          render: (data: any) => {
            return data === '------' ? '<div class="text-column-8">------</div>' : data;
          }
        },
        {
          targets: 2,
          render: (data: string, type: any, row: any) => {
            const visitorDocument = row[5];
            const plate = row[7];
            const splitedData = data.split('!-');

            const movementType = splitedData.at(0) + '';
            const lastMovement = (splitedData.at(1) + '') === 'true'; 

            const style = ENTRY_STYLES[movementType.toLocaleLowerCase() as keyof typeof ENTRY_STYLES];
            const buttonAddition = `
            role="button" onclick="window.dispatchEvent(new CustomEvent('Movment', { 
                    detail: { 
                      document: '${visitorDocument}', 
                      type: '${movementType.toLocaleLowerCase()}', 
                      plate: '${plate}' 
                    }
                  }))"
            `
            
            return `
            <div class="d-flex justify-content-center">
              <span class="badge rounded-pill user-select-none" 
                    style="background-color: ${style.color}; color: white;"
                    ${lastMovement ? buttonAddition : ''}
                    title="Registrar ${style.text == 'Entrada' ? 'salida' : 'entrada'}"
                    data-title="${style.text}">
                ${style.text}
              </span>
            </div>
            `;
          }
        },
        {
          // Asumiendo que la columna de tipo es la 3 (ajusta según tu estructura)
        //ACA SE CONFIGURAN LOS otomes de las columnas
      targets: 3,
      className: 'text-center',
      render: (data: string, type: any, row: any) => {
        // Busca la configuración del tipo de usuario en USER_TYPE_ICONS
        const typeConfig = this.USER_TYPE_ICONS[data as keyof typeof this.USER_TYPE_ICONS] || {
          icon: 'bi bi-question-lg',
          color: 'grey',
          title: 'Desconocido'
        };
        
        const visitorDocument = row[5];
        return `
          <button style="background-color: ${typeConfig.color}; border: none;" 
                  class="btn btn-primary" 

                  onclick="window.dispatchEvent(new CustomEvent('openModalInfo', { detail: '${visitorDocument}' }))"
                  title="${typeConfig.title}">
            <i class="${typeConfig.icon}"><div class="d-none">${typeConfig.title}</div></i>
          </button>`;
      }
    }
  ];
  }
}


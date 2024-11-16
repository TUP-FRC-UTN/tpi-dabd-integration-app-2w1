import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'supplierType',
  standalone: true
})
export class SupplierTypePipe implements PipeTransform {
 
  private movementTypes: { [key: string]: string } = {
    'OTHER': 'OTRO',
    'OUTSOURCED_SERVICE': 'SERVICIO TERCERIZADO',
    'INVENTORY_SUPPLIER': 'PROVEEDOR DE INVENTARIO',
  };

  transform(value: string): string {
    
    return this.movementTypes[value] || value || 'Tipo desconocido';
  }
}

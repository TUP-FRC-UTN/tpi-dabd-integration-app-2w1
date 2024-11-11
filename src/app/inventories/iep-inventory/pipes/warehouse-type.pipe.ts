import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'warehouseType',
  standalone: true
})
export class WarehouseTypePipe implements PipeTransform {

  private movementTypes: { [key: string]: string } = {
    'RETURN': 'Devolución',
    'LOAN': 'Préstamo',
    'TO_MAINTENANCE': 'Uso',
  };

  transform(value: string): string {
    
    return this.movementTypes[value] || value || 'Tipo desconocido';
  }
}

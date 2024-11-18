import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

    //Parsea el formato de la fecha para que sea compatible con el input 
  static parseDateString(dateString: string): Date | null {
    const [day, month, year] = dateString.split('-').map(Number);
    if (!day || !month || !year) {      
      return null;
    }
    // Crea un objeto Date con formato "yyyy-MM-dd"    
    return new Date(year, month - 1, day); // Restamos 1 al mes porque en JavaScript los meses son 0-indexed
  }

  static formatDate(date: Date): string {
    return formatDate(date, 'yyyy/MM/dd', 'en-US');
  }
}

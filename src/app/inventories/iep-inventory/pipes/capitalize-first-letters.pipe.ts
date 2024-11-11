import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeFirstLetters',
  standalone: true
})
export class CapitalizeFirstLettersPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value; // Retorna la cadena original si es nula o vacía

    return value.split(' ')
      .map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(' ');
  }}
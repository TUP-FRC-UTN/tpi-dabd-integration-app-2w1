import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-kpi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-kpi.component.html',
  styleUrls: ['./custom-kpi.component.css']
})
export class CustomKpiComponent {

  constructor() { }

  @Input() value: any = 0;
  @Input() title: string = '';
  @Input() subTitle: string = '';
  @Input() tooltip: string = '';
  @Input() customStyles: { [key: string]: string } = {};
  @Input() icon: string = '';
  @Input() formatPipe: string = '';


  get Value() {
    let formattedValue: any;
    switch (this.formatPipe) {
      case 'currency': {
        formattedValue = this.value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        break;
      }

      case 'percentage': {
        formattedValue = (this.value / 100).toLocaleString('es-AR', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 2 });
        break;
      }

      case 'text': {
        formattedValue = this.value.toString();
        break;
      }

      case 'number': {
        formattedValue = this.value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        break;
      }
      
      default: {
        formattedValue = this.value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        break;
      }

    }

    return formattedValue;
  }
}

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


  getValue() {
    let formattedValue: any;
    switch (this.formatPipe) {
      case 'currency': {
        formattedValue = this.value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        break;
      }

      case 'percentage': {
        formattedValue = (this.value / 100).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 2 });
        formattedValue += '%';
        alert(formattedValue);
        break;
      }

      case 'text': {
        formattedValue = this.value.toString();
        break;
      }

      default: {
        formattedValue = this.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        break;
      }

    }

    return formattedValue;
  }
}

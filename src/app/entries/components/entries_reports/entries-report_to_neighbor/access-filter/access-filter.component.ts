import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-access-filter',
  standalone: true,
  imports: [FormsModule, NgSelectModule, CommonModule],
  templateUrl: './access-filter.component.html',
  styleUrls: ['./access-filter.component.css']
})
export class AccessFilterComponent implements OnInit {
  @Output() filterSubmitted = new EventEmitter<{ year: number, month: number }>();
  anios: number[] = [];
  meses: number[] = [];

  selectedAnio: number | null = null;
  selectedMes: number | null = null;

  ngOnInit() {
    this.initializeYears();
    this.initializeMonths();
  }

  initializeYears() {
    const currentYear = new Date().getFullYear();
    this.anios = Array.from({ length: 5 }, (_, i) => currentYear - i);
  }

  initializeMonths() {
    this.meses = Array.from({ length: 12 }, (_, i) => i + 1);
  }

  onValueChange() {
    if (this.selectedAnio && this.selectedMes) {
      this.filterSubmitted.emit({ 
        year: this.selectedAnio, 
        month: this.selectedMes 
      });
      console.log('Valores actualizados', {
        anio: this.selectedAnio,
        mes: this.selectedMes
      });
    }
  }
}
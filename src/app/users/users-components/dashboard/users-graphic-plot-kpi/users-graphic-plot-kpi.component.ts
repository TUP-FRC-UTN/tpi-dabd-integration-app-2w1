import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PlotTypeCount } from '../../users-models/dashboard/PlotTypeCount';
import { PlotStateCount } from '../../users-models/dashboard/PlotStateCount';
import { Observable } from 'rxjs';
import { UsersGraphicPlotComponent } from "../users-graphic-plot/users-graphic-plot.component";
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-graphic-plot-kpi',
  standalone: true,
  imports: [UsersGraphicPlotComponent, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './users-graphic-plot-kpi.component.html',
  styleUrls: ['./users-graphic-plot-kpi.component.css']
})
export class UsersGraphicPlotKPIComponent implements OnInit {
  totalLots: number = 0;
  residentialLots: number = 0;
  commercialLots: number = 0;
  emptyLots: number = 0;

  startDate = new FormControl('');
  endDate = new FormControl('');
  selectedPlotType: string | undefined = '';
  
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getPlotsByState().subscribe(data => {
      this.updateTotalLots(data);
    });

    this.getPlotsByType().subscribe(data => {
      this.updateTypeCounts(data);
    });
  }

  private getPlotsByType(): Observable<PlotTypeCount[]> {
    return this.http.get<PlotTypeCount[]>('http://localhost:9062/dashboard/Plot-By-Type-Count');
  }

  private getPlotsByState(): Observable<PlotStateCount[]> {
    return this.http.get<PlotStateCount[]>('http://localhost:9062/dashboard/Plot-By-State-Count');
  }

  private updateTypeCounts(data: PlotTypeCount[]) {
    this.residentialLots = 0;
    this.commercialLots = 0;
    this.emptyLots = 0;
    data.forEach(item => {
      switch (item.type) {
        case 'Residencial':
          this.residentialLots = item.count;
          break;
        case 'Comercial':
          this.commercialLots = item.count;
          break;
        case 'Baldío':
          this.emptyLots = item.count;
          break;
      }
    });
  }

  private updateTotalLots(data: PlotStateCount[]) {
    this.totalLots = data.reduce((acc, curr) => acc + curr.count, 0);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  filterByDate() {
    const startDateValue = this.startDate.value;
    const endDateValue = this.endDate.value;

    if (startDateValue && endDateValue) {
      const start = new Date(startDateValue);
      const end = new Date(endDateValue);

      if (start > end) {
        console.error('Fecha inicial no puede ser mayor a la fecha final');
        return;
      }

      const formattedStartDate = this.formatDate(start);
      const formattedEndDate = this.formatDate(end);

      this.updateDashboardData(formattedStartDate, formattedEndDate);
    }
  }

  private updateDashboardData(startDate: string, endDate: string) {
    // Llamamos a los métodos de backend con los parámetros de fecha
    this.getPlotsByStateWithDate(startDate, endDate).subscribe(data => {
      this.updateTotalLots(data);
    });

    this.getPlotsByTypeWithDate(startDate, endDate).subscribe(data => {
      this.updateTypeCounts(data);
    });
  }

  private getPlotsByStateWithDate(startDate: string, endDate: string): Observable<PlotStateCount[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    return this.http.get<PlotStateCount[]>(`http://localhost:9062/dashboard/Plot-By-State-Count`, {params});
  }

  private getPlotsByTypeWithDate(startDate: string, endDate: string): Observable<PlotTypeCount[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    return this.http.get<PlotTypeCount[]>(`http://localhost:9062/dashboard/Plot-By-Type-Count`, {params});
  }

  applyAdvancedFilters() {
    if (!this.selectedPlotType) {
      console.warn('Debe seleccionar un tipo de lote para aplicar el filtro.');
      return;
    }

    // Filtrar por tipo de lote
    this.getPlotsByTypeWithFilter(this.selectedPlotType).subscribe(data => {
      this.updateTypeCounts(data);
    });

    // Filtrar por fecha si es necesario
    const startDateValue = this.startDate.value;
    const endDateValue = this.endDate.value;

    if (startDateValue && endDateValue) {
      const start = new Date(startDateValue);
      const end = new Date(endDateValue);
      const formattedStartDate = this.formatDate(start);
      const formattedEndDate = this.formatDate(end);

      this.updateDashboardData(formattedStartDate, formattedEndDate);
    }
  }

  private getPlotsByTypeWithFilter(type: string): Observable<PlotTypeCount[]> {
    return this.http.get<PlotTypeCount[]>(`http://localhost:9062/dashboard/Plot-By-Type-Count?type=${type}`);
  }

  clearFilters() {
    this.startDate.reset();
    this.endDate.reset();
    this.selectedPlotType = '';
    
    // Vuelvo a cargar los datos sin filtros
    this.getPlotsByState().subscribe(data => {
      this.updateTotalLots(data);
    });

    this.getPlotsByType().subscribe(data => {
      this.updateTypeCounts(data);
    });
  }
}

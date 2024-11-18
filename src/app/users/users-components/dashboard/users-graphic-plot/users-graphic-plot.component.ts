import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlotStateCount } from '../../users-models/dashboard/PlotStateCount';
import { CommonModule } from '@angular/common';
import { ChartType, GoogleChartComponent, GoogleChartsModule } from 'angular-google-charts';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../users-servicies/dashboard.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PlotTypeCount } from '../../users-models/dashboard/PlotTypeCount';
import { UsersKpiComponent } from "../users-kpi/users-kpi.component";

@Component({
  selector: 'app-users-graphic-plot',
  standalone: true,
  imports: [GoogleChartsModule, CommonModule, ReactiveFormsModule, UsersKpiComponent],
  templateUrl: './users-graphic-plot.component.html',
  styleUrls: ['./users-graphic-plot.component.css']
})
export class UsersGraphicPlotComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);
  subscriptions = new Subscription();

  totalLots: number = 0;
  residentialLots: number = 0;
  commercialLots: number = 0;
  emptyLots: number = 0;

  loadingPieChart = true;
  errorPieChart: string | null = null;

  startDate = new FormControl('');
  endDate = new FormControl('');
  plotTypes = new FormControl('');

  selectedPlotType: number | undefined = undefined;
  
  plotStateData: any[] = [];

  pieChart = ChartType.PieChart;
  pieChartOptions = {
    pieHole: 0.4,
    backgroundColor: 'transparent',
    colors: ['#2196F3', '#4CAF50', '#F44336'],
    legend: {
      position: 'right',
      textStyle: { color: '#495057', fontSize: 12 },
      alignment: 'center'
    },
    chartArea: { width: '100%', height: '80%' },
    tooltip: {
      textStyle: { fontSize: 14, color: '#495057' },
      showColorCode: true,
      trigger: 'both'
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPlotStateData();
    this.loadPlotTypeData();
    this.setupFilters();
  }

  private setupFilters() {
    // Suscribirse a cambios en los filtros y actualizar los datos en consecuencia
    this.subscriptions.add(
      this.startDate.valueChanges.subscribe(() => this.applyFilters())
    );
    this.subscriptions.add(
      this.endDate.valueChanges.subscribe(() => this.applyFilters())
    );
    this.subscriptions.add(
      this.plotTypes.valueChanges.subscribe(value => {
        this.selectedPlotType = value ? Number(value) : undefined;
        this.applyFilters();
      })
    );
  }

  private applyFilters() {
    const startDate = this.startDate.value ? this.formatDate(new Date(this.startDate.value)) : undefined;
    const endDate = this.endDate.value ? this.formatDate(new Date(this.endDate.value)) : undefined;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      this.errorPieChart = 'La fecha inicial no puede ser mayor a la fecha final';
      return;
    }

    this.errorPieChart = null;
    this.loadPlotStateData(startDate, endDate, this.selectedPlotType);
    this.loadPlotTypeData(startDate, endDate);
  }
  
  private loadPlotStateData(startDate?: string, endDate?: string, plotType?: number) {
    this.loadingPieChart = true;
    this.errorPieChart = null;

    this.subscriptions.add(
      this.dashboardService.getPlotsByState(startDate, endDate, plotType).subscribe({
        next: (data: PlotStateCount[]) => {
          this.loadingPieChart = false;
          this.processPlotStateData(data);
          this.updateTotalLots(data);
        },
        error: () => {
          this.errorPieChart = 'Error al cargar los datos de estado de los lotes';
          this.loadingPieChart = false;
        }
      })
    );
  }

  private processPlotStateData(data: PlotStateCount[]) {
    this.plotStateData = data.map(item => [
      `${item.state} (${item.count})`, item.count
    ]);
  }

  private loadPlotTypeData(startDate?: string, endDate?: string, plotType?: number) {

    this.subscriptions.add(
      this.dashboardService.getPlotsByType(startDate, endDate).subscribe({
        next: (data: PlotTypeCount[]) => {
          this.updateTypeCounts(data);
        },
        error: () => {
          console.error('Error al cargar los datos de tipo de lote');
        }
      })
    );

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
    this.loadPlotStateData(startDate, endDate);
    this.loadPlotTypeData(startDate, endDate);
  }

  clearFilters() {
    this.startDate.reset();
    this.endDate.reset();
    this.plotTypes.reset();
    this.selectedPlotType = undefined;
    
    // Vuelvo a cargar los datos sin filtros
    this.loadPlotStateData();
    this.loadPlotTypeData();
  }

  changeView(view: string){
    this.router.navigate(['home/charts/users' + view]);
  }
}

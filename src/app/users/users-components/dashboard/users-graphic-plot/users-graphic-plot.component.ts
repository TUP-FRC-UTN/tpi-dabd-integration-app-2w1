import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlotStateCount } from '../../users-models/dashboard/PlotStateCount';
import { CommonModule } from '@angular/common';
import { ChartType, GoogleChartComponent, GoogleChartsModule } from 'angular-google-charts';

@Component({
  selector: 'app-users-graphic-plot',
  standalone: true,
  imports: [GoogleChartsModule, CommonModule],
  templateUrl: './users-graphic-plot.component.html',
  styleUrls: ['./users-graphic-plot.component.css']
})
export class UsersGraphicPlotComponent implements OnInit {
  private readonly http = inject(HttpClient);

  loading = true;
  error: string | null = null;

  // Datos para el gráfico circular
  plotStateData: any[] = [];
  pieChart = ChartType.PieChart;
  pieChartOptions = {
    titleTextStyle: {
      color: '#495057',
      fontSize: 18,
      bold: true
    },
    pieHole: 0.4,
    backgroundColor: 'transparent',
    colors: ['#2196F3', '#4CAF50', '#F44336'],
    legend: {
      position: 'bottom',
      textStyle: { color: '#495057', fontSize: 12 },
      alignment: 'center'
    },
    chartArea: { width: '90%', height: '80%' },
    tooltip: {
      textStyle: { fontSize: 14, color: '#495057' },
      showColorCode: true,
      trigger: 'both'
    
    }
  };

  ngOnInit() {
    this.loadPlotStateData();
  }

  private loadPlotStateData() {
    this.loading = true;
    this.error = null;

    this.http.get<PlotStateCount[]>('http://localhost:9062/dashboard/Plot-By-State-Count')
      .subscribe({
        next: (data) => {
          this.loading = false;
          this.processPlotStateData(data);
        },
        error: () => {
          this.error = 'Error al cargar los datos de estado de los lotes';
          this.loading = false;
        }
      });
  }

  private processPlotStateData(data: PlotStateCount[]) {
    // Preparar los datos para el gráfico
    const total = data.reduce((sum, item) => sum + item.count, 0);
  
    // Concatenamos la cantidad junto con el nombre del estado
    this.plotStateData = data.map(item => [
      `${item.state} (${item.count})`, item.count
    ]);
  }
}

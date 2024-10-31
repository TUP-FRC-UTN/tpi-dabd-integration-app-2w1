import { Component, OnInit } from '@angular/core';
import { AccessMetricsService } from '../../../services/access-metric/access-metrics.service';
import { GoogleChartsModule } from 'angular-google-charts';
import { NgIf } from '@angular/common';

@Component({
  selector: 'access-app-areachart',
  standalone: true,
  imports: [GoogleChartsModule,NgIf],
  templateUrl: './access-areachart.component.html',
  styleUrl: './access-areachart.component.css'
})
export class AccessAreachartComponent implements OnInit {
  chartData: any;

  constructor(private metricsService: AccessMetricsService) { }

  ngOnInit(): void {
    this.fetchDataAndDrawChart();
  }

  fetchDataAndDrawChart() {
    this.metricsService.getMonthlyVisitorCountsByType().subscribe(
      data => {
        let processedData = this.processChartData(data);
        this.chartData = {
          title: 'Comparación de Entradas: Residentes vs. Visitantes',
          type: 'AreaChart',
          data: processedData,
          columnNames: ['Mes', 'Residentes', 'Visitantes'],
          options: {
            title: 'Entradas Mensuales',
            hAxis: {
              title: 'Mes',
              minValue: 1,
              maxValue: 12
            },
            vAxis: {
              title: 'Cantidad de Entradas'
            },
            isStacked: true
          },
          width: 700,
          height: 400
        };
      },
      error => {
        console.error('Error al obtener los datos', error);
      }
    );
  }

  processChartData(data: any[]): any[] {
    // Inicializa un objeto para almacenar los conteos mensuales por tipo
    let monthlyCounts: { [month: number]: { residentes: number; visitantes: number } } = {};

    // Organiza los datos en el objeto por tipo de observación y mes
    data.forEach(item => {
      let month = item.month;
      let count = item.count;
      let observation = item.observation;

      if (!monthlyCounts[month]) {
        monthlyCounts[month] = { residentes: 0, visitantes: 0 };
      }

      if (observation.includes('residente')) {
        monthlyCounts[month].residentes += count;
      } else if (observation.includes('visitante')) {
        monthlyCounts[month].visitantes += count;
      }
    });

    // Convierte el objeto a un array en el formato esperado por Google Charts
    let chartData = Object.keys(monthlyCounts).map(month => [
      `Mes ${month}`, 
      monthlyCounts[parseInt(month)].residentes,
      monthlyCounts[parseInt(month)].visitantes
    ]);

    return chartData;
  }
}

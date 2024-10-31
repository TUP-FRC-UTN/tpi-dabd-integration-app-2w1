import { Component, OnInit } from '@angular/core';
import { GoogleChartsModule } from 'angular-google-charts';
import { AccessMetricsService } from '../../../services/access-metric/access-metrics.service';

@Component({
  selector: 'access-app-piechart',
  standalone: true,
  imports: [GoogleChartsModule],
  templateUrl: './access-piechart.component.html',
  styleUrl: './access-piechart.component.css'
})
export class AccessPiechartComponent implements OnInit {
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
          title: 'Distribución de tipos de ingresantes',
          type: 'PieChart',
          data: processedData,
          columnNames: ['Tipo de Ingresante', 'Cantidad'],
          options: {
            title: 'Distribución de tipos de ingresantes',
            is3D: true,
          },
          width: 600,
          height: 400
        };
      },
      error => {
        console.error('Error al obtener los datos', error);
      }
    );
  }

  processChartData(data: any[]): any[] {
    // Inicializa un objeto para almacenar la suma de los contadores por tipo de observación
    let visitorCountsByType: { [key: string]: number } = {};
  
    data.forEach(item => {
      let observation = item.observation;
      let count = item.count;
      if(observation == "Ingreso personal de limpieza"){
        observation = "Personal de limpieza"
      }
      // Suma el conteo para cada observación
      if (visitorCountsByType[observation]) {
        visitorCountsByType[observation] += count;
      } else {
        visitorCountsByType[observation] = count;
      }
    });
  
    // Convierte el objeto a un array en el formato esperado por Google Charts
    let chartData = Object.keys(visitorCountsByType).map(observation => [observation, visitorCountsByType[observation]]);
  
    return chartData;
  }
  
}

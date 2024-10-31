import { Component, OnInit } from '@angular/core';
import { GoogleChartsModule } from 'angular-google-charts';
import { AccessMonthlyVisitorCount } from '../../../models/access-visitors-count/access-monthly-visitor-count';
import { AccessMetricsService } from '../../../services/access-metric/access-metrics.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'access-app-dashboard',
  standalone: true,
  imports: [GoogleChartsModule,NgIf],
  templateUrl: './access-dashboard.component.html',
  styleUrl: './access-dashboard.component.css'
})
export class AccessDashboardComponent implements OnInit {
  chart: any;

  monthlyVisitorCount: AccessMonthlyVisitorCount[] = []


  constructor(private metricService: AccessMetricsService) {}

  private getMonthName(month: number): string {
    let monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 
      'Mayo', 'Junio', 'Julio', 'Agosto', 
      'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[month - 1]; // Ajusta el índice ya que los meses comienzan desde 1
  }

  drawChartColumn() {
    // Mapea monthlyVisitorCount a un array que Google Charts pueda entender
    let dataApi = this.monthlyVisitorCount.map(v => [
      this.getMonthName(v.month), // Nombre del mes
      v.count                      // Cantidad
    ]);
  
    this.chart = {
      title: 'Accesos totales por mes',
      type: 'ColumnChart',
      data: [
  
        ...dataApi
      ],
      options: {
        hAxis: { title: 'Mes' },
        vAxis: { title: 'Cantidad' },
        legend: 'none'
      },
      width: 650,
      height: 400
    };
  }

  ngOnInit(): void {

    this.metricService.getMonthlyVisitorCounts().subscribe(data => {  
      this.monthlyVisitorCount = data; // Asigna los datos obtenidos 
      this.drawChartColumn(); // Dibuja el gráfico después de recibir los datos
    });

    //this.drawChartColumn();
  }






}

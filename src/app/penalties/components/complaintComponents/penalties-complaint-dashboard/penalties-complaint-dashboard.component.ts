import { Component, inject } from '@angular/core';
import { ComplaintService } from '../../../services/complaintsService/complaints.service';
import { ComplaintDto, EstadoDenuncia, TipoDenuncia } from '../../../models/complaint';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { State } from '@popperjs/core';
import { ReportReason } from '../../../models/Dashboard-models';
import { ReportReasonDto } from '../../../models/ReportReasonDTO';

@Component({
  selector: 'app-penalties-complaint-dashboard',
  standalone: true,
  imports: [GoogleChartsModule,FormsModule,CommonModule],
  templateUrl: './penalties-complaint-dashboard.component.html',
  styleUrl: './penalties-complaint-dashboard.component.scss'
})
export class PenaltiesComplaintDashboardComponent {
  private sanctionsService:ComplaintService = inject(ComplaintService)
  complaintsData: ComplaintDto[] = [];
  status: number = 0;
  periodFrom: string = this.getDefaultFromDate();
  periodTo: string = this.getCurrentYearMonth();
  stateFilter:string = ""
  //filtros avanzados
  states:any[] = []
  reportsReasons:ReportReasonDto[] = []
  /////////////////////////
  state = ''
  reportReason = ''
  reportReason2 = ''
  //filtros avanzados
  complaintState: EstadoDenuncia = EstadoDenuncia.Aprobada;
  complaintType: TipoDenuncia = TipoDenuncia.Daño;

  pieChartData: any[] = [];
  lineChartData: any[] = [];
  columnChartData: any[] = [];

  pieChartType = ChartType.PieChart;
  lineChartType = ChartType.LineChart;
  columnChartType = ChartType.ColumnChart;
  pieChartOptions = {
    backgroundColor: 'transparent',
    
    legend: {
      position: 'right',
      textStyle: { color: '#6c757d', fontSize: 17 }
    },
    chartArea: { width: '100%', height: '100%' },
    pieHole: 0,
    height: '80%',
    slices: {
      0: { color: '#8A2BE2' },  // MP siempre azul
      1: { color: '#00BFFF' },  // STRIPE siempre violeta
      2: { color: '#FF4500' },
      3:{color:'#32CD32'},
      4:{color:'#666666'}   // EFECTIVO siempre verde
    },
    pieSliceTextStyle: {
      color: 'black',
      fontSize: 14
    }
  };

  // pieChartOptions = {
  //   backgroundColor: 'transparent',
  //   colors: ['#8A2BE2', '#00BFFF', '#FF4500', '#32CD32'],
  //   legend: {
  //     position: 'right',
  //     textStyle: { color: '#000000', fontSize: 17 },
  //   },
  //   pieSliceText: 'none',  // Oculta los porcentajes dentro del gráfico
  //   chartArea: { width: '80%', height: '80%' },
  //   pieHole: 0.7,
  //   height: '80%',
  //   title: 'Distribución de Tipos de Multas',
  // };
  lineChartOptions = {
    backgroundColor: 'transparent',
    colors: ['#24f73f'],
    legend: { position: 'none' },
    chartArea: { width: '90%', height: '80%' },
    vAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Cantidad de Denuncias'
    },
    hAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Periodo'
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    title: 'Evolución de Denuncias por Mes'
  };

  columnChartOptions = {
    backgroundColor: 'transparent',
    colors: ['#24473f', '#FF4500', '#32CD32', '#8A2BE2'], // Colores por estado
    legend: { position: 'none' },
    chartArea: { width: '80%', height: '75%' },
    vAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Cantidad'
    },
    hAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Estado de Denuncias'
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    height: 600,
    width: '100%',
    bar: { groupWidth: '70%' },
    title: 'Cantidad de Denuncias por Estado'
  };

  //constructor(private sanctionsService: SanctionsService) {}

  getCurrentYearMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  getDefaultFromDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  ngOnInit() {
    this.updateCharts();
    this.getReportReasons();
    this.getStates();
  }
  getReportReasons(){
    this.sanctionsService.getAllReportReasons().subscribe(
      (respuesta) => {
        this.reportsReasons = respuesta
      },
      (error) => {
        console.error('Error:', error);
    });
  }
  getStates(){
    this.sanctionsService.getState().subscribe(
      (respuesta) => {
        this.states = Object.entries(respuesta).map(([key, value]) => ({ key, value }));
      },
      (error) => {
        console.error('Error:', error);
    });
  }

  applyFilters() {
    this.updateCharts();
  }

  private updateColumnChart() {
    console.log(this.state)
    if(this.reportReason == ""){
    const complaintsByState = this.complaintsData.reduce((acc: any, complaint) => {
      acc[complaint.complaintState] = (acc[complaint.complaintState] || 0) + 1;
      return acc;
    }, {});
    this.columnChartData = Object.entries(complaintsByState).map(([state, count]) => [
      state,
      count
    ]);
  }
  else{
    const filteredComplaints = this.complaintsData.filter(complaint => {
      return complaint.complaintReason === this.reportReason; // Filtra por el campo 'reportReason'
    });
  
    const complaintsByState = filteredComplaints.reduce((acc: any, complaint) => {
      acc[complaint.complaintState] = (acc[complaint.complaintState] || 0) + 1;
      return acc;
    }, {});
  
    this.columnChartData = Object.entries(complaintsByState)
      .map(([state, count]) => [state, count]);
  }
  }

  private updateLineChart() {
    if(this.reportReason2 == ""){
    const fromDate = new Date(this.periodFrom + '-01'); 
  const toDate = new Date(this.periodTo + '-01');
  toDate.setMonth(toDate.getMonth() + 1); 
  const complaintsInRange = this.complaintsData.filter(complaint => {
    const complaintDate = new Date(complaint.createdDate);
    return complaintDate >= fromDate && complaintDate < toDate;
  });
  const complaintsByMonth = complaintsInRange.reduce((acc: any, complaint) => {
    const month = new Date(complaint.createdDate).toLocaleString('default', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  const lineChartData = [];
  let currentDate = new Date(fromDate);
  while (currentDate < toDate) {
    const monthLabel = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    lineChartData.push([monthLabel, complaintsByMonth[monthLabel] || 0]); // 0 si no hay denuncias en ese mes
    currentDate.setMonth(currentDate.getMonth() + 1); // Avanzar al siguiente mes
  }

  this.lineChartData = lineChartData;
  }
  else{
    
  }
}

  private updatePieChart() {
    console.log(this.state)
    if(this.state == ""){
    console.log(this.state)
    const complaintsByType = this.complaintsData.reduce((acc: any, complaint) => {
      acc[complaint.complaintReason] = (acc[complaint.complaintReason] || 0) + 1;
      return acc;
    }, {});
    this.pieChartData = Object.entries(complaintsByType)
      .map(([type, count]) => [type, count]);
  }
  else{
    const filteredComplaints = this.complaintsData.filter(complaint => {
      return complaint.complaintState === this.state; // Filtra por el campo 'state'
    });
  
    const complaintsByType = filteredComplaints.reduce((acc: any, complaint) => {
      acc[complaint.complaintReason] = (acc[complaint.complaintReason] || 0) + 1;
      return acc;
    }, {});
  
    this.pieChartData = Object.entries(complaintsByType)
      .map(([type, count]) => [type, count]);
  }
  }

  updateCharts() {
    this.sanctionsService.getAllComplaints().subscribe({
      next: (complaints) => {
        const fromDate = new Date(this.periodFrom + '-01');
        const toDate = new Date(this.periodTo + '-01');
        toDate.setMonth(toDate.getMonth() + 1); 
        this.complaintsData = complaints.filter(complaint => {
          const complaintDate = new Date(complaint.createdDate);
          return complaintDate >= fromDate && complaintDate < toDate;
        });
        this.updatePieChart();
        this.updateLineChart();
        this.updateColumnChart();
      },
      error: (error) => {
        console.error('Error al obtener denuncias:', error);
      }
    });
  }

  makeBig(nro: number) {
    this.status = nro;
  }
}

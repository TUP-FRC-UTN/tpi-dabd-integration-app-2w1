import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service';
import { EmpListadoAsistencias } from '../../Models/emp-listado-asistencias';
import { FormsModule } from '@angular/forms';
import { EmpListadoEmpleados } from '../../Models/emp-listado-empleados';
import { ListadoDesempeñoService } from '../../services/listado-desempeño.service';
import { WakeUpCallDetail } from '../../Models/listado-desempeño';

@Component({
  selector: 'app-iep-charts-employees',
  standalone: true,
  imports: [GoogleChartsModule, CommonModule, FormsModule],
  templateUrl: './iep-charts-employees.component.html',
  styleUrl: './iep-charts-employees.component.css'
})
export class IepChartsEmployeesComponent implements OnInit{
  empleadosService = inject(EmpListadoEmpleadosService);
  llamadosService = inject(ListadoDesempeñoService);
  
  asistencias: EmpListadoAsistencias[] = [];
  empleados: EmpListadoEmpleados[] = [];
  llamados: WakeUpCallDetail[]= [];

  empleado: string = "";
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  chartTypeAsistencias: ChartType = ChartType.PieChart;
  dataAsistencias: any[] = [];
  columnNamesAsistencias = ['Estado', 'Porcentaje'];
  chartOptionsAsistencias = {
    title: 'Total asistencias',
    colors: ['#28a745', '#dc3545', '#ffc107', '#6f42c1']
  };

  chartTypeLlamados: ChartType = ChartType.ColumnChart;
  dataLlamados: any[] = [];
  columnNamesLlamados = ['Año', 'Leve','Moderado','Severo'];
  chartOptionsLlamados = {
    title: 'Llamados de atencion',
    colors: ['#28a745', '#ffc107','#dc3545'],
    isStacked: true
  };

  chartTypeCargos: ChartType = ChartType.PieChart;
  dataCargos: any[] = [];
  columnNamesCargos = ['Tipo', 'Porcentaje'];
  chartOptionsCargos = {
    title: 'Tipos empleados',
    colors: [
      '#0000FF', '#FF0000', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF',
      '#FFA500', '#800080', '#008000', '#FFC0CB', '#FFD700', '#A52A2A',
      '#F08080', '#C0C0C0', '#808080', '#000080', '#800000', '#808000',
      '#FF4500', '#2E8B57', '#8A2BE2', '#5F9EA0', '#D2691E', '#CD5C5C',
      '#4B0082', '#FF6347', '#7FFF00', '#FFDAB9', '#B0E0E6', '#98FB98',
      '#FF69B4', '#F0E68C', '#ADFF2F', '#4682B4', '#D8BFD8', '#DDA0DD',
      '#F5DEB3', '#FFE4E1', '#FFB6C1', '#20B2AA', '#FF8C00', '#B22222',
      '#5F9EA0', '#6A5ACD', '#7CFC00', '#FF1493', '#8B4513', '#B8860B',
      '#A9A9A9', '#00FA9A', '#F0E68C', '#FFD700', '#1E90FF', '#FF7F50',
      '#DC143C', '#00BFFF', '#4682B4', '#32CD32', '#ADFF2F', '#FF4500'
    ]
  };

  width = 800;
  height = 800;

  ngOnInit(): void {
    this.loadAsistencias();
    this.loadEmpleados();
    this.loadLlamados();
  }

  loadEmpleados(): void {
     const empSubscription = this.empleadosService.getEmployees().subscribe({
     next: (Empleados) =>{
        this.empleados = [];
        this.empleados = Empleados;
        this.cargarTiposEmpleados();
       }
     })
   }

  loadAsistencias(): void {
    this.asistencias = [];
    const empSubscription = this.empleadosService.getAttendances().subscribe({
      next: (Asistencias) => {
        this.asistencias = []
        this.asistencias = Asistencias;
        this.filtrar();
        this.cargarAsistencias();
      }
    })
  }

  loadLlamados(): void{
    this.llamados = []
    const empSubscription = this.llamadosService.getWakeUpCallDetails().subscribe({
      next: (Llamados) => {
        this.llamados = [];
        this.llamados = Llamados;
        this.cargarLlamados();
      }
    })
  }
   
  cargarAsistencias(){
    var p = 0;
    var au = 0;
    var t = 0;
    var j = 0;
    const total = this.asistencias.length;
    console.log("Total:"+total);

    this.asistencias.forEach(a => {
      switch(a.state){
        case "PRESENTE": p++; break;
        case "AUSENTE": au++; break;
        case "TARDE": t++; break;
        case "JUSTIFICADO": j++; break;
      }
    });

    this.dataAsistencias = [];

    this.dataAsistencias.push(["Presente", p / total * 100],["Ausente", au / total * 100],
    ["Tarde", t / total * 100],["Justificado", j / total * 100]);
  }
  
  cargarTiposEmpleados(){
    const tipos: Set<string> = new Set();

    console.log(this.empleados)
    this.empleados.forEach(empleado => {
      tipos.add(empleado.position);
    });

    const tiposSinDuplicados: string[] = Array.from(tipos);
    this.dataCargos = [];
    tiposSinDuplicados.forEach(tipo => {
      const empleadosConTipo = this.empleados.filter(empleado => empleado.position === tipo);

      this.dataCargos.push([tipo, empleadosConTipo.length / this.empleados.length * 100])
    });
  }
  
  cargarLlamados(){
    const tipos: Set<number> = new Set();

    this.llamados.forEach(llamado => {
      tipos.add(llamado.dateReal[0])
    });

    const añosLlamados: number[] = Array.from(tipos);
    añosLlamados.sort((a, b) => a - b);

    this.dataLlamados = [];
    añosLlamados.forEach(año => {

      var l = 0;
      var m = 0;
      var s = 0;

      this.llamados.forEach(llamado => {
        if(llamado.dateReal[0] === año){
          switch (llamado.wackeUpTypeEnum){
            case "LEVE": l++; break;
            case "MODERADO": m++; break;
            case "SEVERO": s++; break;
          }
        }
      });

      this.dataLlamados.push([año.toString(),l,m,s])
    });
  }

  filtrar(){
    var asistenciasFiltradas: EmpListadoAsistencias[] = this.asistencias;

    if (this.empleado){
      asistenciasFiltradas = asistenciasFiltradas.filter(asistencia => {
        return asistencia.employeeName === this.empleado;
      })
    }
    
    if (this.fechaInicio || this.fechaFin){
      const inicioDate = this.fechaInicio ? new Date(this.fechaInicio) : null;
      const finDate = this.fechaFin ? new Date(this.fechaFin) : null; 

      asistenciasFiltradas = asistenciasFiltradas.filter(asistencia => {

      const asistenciaDateParts = asistencia.date.split('/'); // Si es DD/MM/YYYY
      const asistenciaDate = new Date(
        Number(asistenciaDateParts[2]), // Año
        Number(asistenciaDateParts[1]) - 1, // Mes (0-indexado)
        Number(asistenciaDateParts[0]) // Día
      );

      if(inicioDate && finDate) {return inicioDate <= asistenciaDate && asistenciaDate <= finDate}
      else if (finDate) { return asistenciaDate <= finDate }
      else if (inicioDate) { return asistenciaDate >= inicioDate; }

      return true;
      })
    }

    this.asistencias = asistenciasFiltradas;
  }

  limpiarFiltro(){
    this.empleado = "";
    this.fechaInicio = null;
    this.fechaFin = null;
    this.loadAsistencias();
  }
}

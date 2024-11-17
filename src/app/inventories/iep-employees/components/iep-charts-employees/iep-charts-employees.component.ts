import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service';
import { EmpListadoAsistencias } from '../../Models/emp-listado-asistencias';
import { FormsModule } from '@angular/forms';
import { EmpListadoEmpleados } from '../../Models/emp-listado-empleados';
import { ListadoDesempeñoService } from '../../services/listado-desempeño.service';
import { WakeUpCallDetail } from '../../Models/listado-desempeño';
import { NgSelectModule } from '@ng-select/ng-select';
import { IepKpiComponent } from "../../../common-components/iep-kpi/iep-kpi.component";

@Component({
  selector: 'app-iep-charts-employees',
  standalone: true,
  imports: [GoogleChartsModule, CommonModule, FormsModule, NgSelectModule, IepKpiComponent],
  templateUrl: './iep-charts-employees.component.html',
  styleUrl: './iep-charts-employees.component.css'
})
export class IepChartsEmployeesComponent implements OnInit{
// Boolean para verificar que se carguen los datos en los graficos por primera vez

// Servicios para hacer GET de los datos
empleadosService = inject(EmpListadoEmpleadosService);
llamadosService = inject(ListadoDesempeñoService);

// Listas para guardar todos los datos
asistencias: EmpListadoAsistencias[] = [];
empleados: EmpListadoEmpleados[] = [];
llamados: WakeUpCallDetail[] = [];

// Listas para guardar los datos filtrados
asistenciasFiltradas: EmpListadoAsistencias[] = [];
llamadosFiltrados: WakeUpCallDetail[] = [];

optionsEmpleados: any[] = [];
empleadosFiltrados: any[] = [];

// Variables para guardar los datos de filtros
fechaInicio!: string;
fechaFin!: string;

// Variables para definir los tipos de graficos a protectar
chartTypeCirculo: ChartType = ChartType.PieChart;
chartTypeColumnas: ChartType = ChartType.ColumnChart;

// Listas con los datos a proyectar en los graficos
dataAsistencias: any[] = [];
dataLlamados: any[] = [];
dataCargos: any[] = [];

//Kpis
kpiPresente: number = 0;
kpiTarde: number = 0;
kpiAusente: number = 0;
kpiJustificado: number = 0;

// Configuraciones para los graficos
chartOptionsAsistencias = {
  colors: ['#28a745', '#dc3545', '#ffc107', '#6f42c1'] ,
  animation: { duration: 1000, easing: 'out', startup: true },
};

columnsLlamados = ['Periodo','Leve','Moderado','Severo']
chartOptionsLlamados = {
  colors: ['#28a745', '#ffc107','#dc3545'],
  vAxis:{ minValue: 0 },
  isStacked: true,
};

ngOnInit(): void {
  this.loadData();
  this.initializeDates();
  this.setInitialDates();
}

initializeDates(): void {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  this.fechaInicio = this.formatInitialFilterDates(thirtyDaysAgo);
  this.fechaFin = this.formatInitialFilterDates(today);
}

private formatInitialFilterDates(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

setInitialDates(): void {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const startDateInput: HTMLInputElement = document.getElementById('fechaInicio') as HTMLInputElement;
  const endDateInput: HTMLInputElement = document.getElementById('fechaFin') as HTMLInputElement;

  startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
  endDateInput.value = today.toISOString().split('T')[0];

  // Establecer los límites de las fechas
  endDateInput.max = today.toISOString().split('T')[0];
  startDateInput.max = endDateInput.value;
  endDateInput.min = startDateInput.value;
}

loadData(){
  this.loadEmpleados();
  this.loadAsistencias();
  this.loadLlamados();
}

loadEmpleados(): void {
   const empSubscription = this.empleadosService.getEmployees().subscribe({
   next: (Empleados) =>{
      this.empleados = [];
      this.empleados = Empleados;
      this.cargarSelectEmpleados();
      //this.cargarTiposEmpleados();
     }
   })
 }

// Metodo para llavar al servicio y conseguir todas las asistencias
loadAsistencias(): void {
  this.asistencias = [];
  const empSubscription = this.empleadosService.getAttendances().subscribe({
    next: (Asistencias) => {
      this.asistencias = [];
      this.asistencias = Asistencias;
      this.asistenciasFiltradas = Asistencias;
      this.filtrarAsistencias();
      this.cargarAsistencias();
    }
  })
}

// Metodo para llavar al servicio y conseguir todos los llamados de atencion
loadLlamados(): void{
  this.llamados = []
  const empSubscription = this.llamadosService.getWakeUpCallDetails().subscribe({
    next: (Llamados) => {
      this.llamados = [];
      this.llamados = Llamados;
      this.llamadosFiltrados = Llamados;
      this.filtrarLlamados();
      this.cargarLlamados();
    }
  })
}

// Metodo para cargar en el grafico los datos de asistencias
cargarAsistencias(){
  var p = 0; var au = 0; 
  var t = 0; var j = 0;
  var total = 0
  this.dataAsistencias = [];

  total = this.asistenciasFiltradas.length;

  this.asistenciasFiltradas.forEach(a => {
    switch(a.state){
      case "PRESENTE": p++; break;
      case "AUSENTE": au++; break;
      case "TARDE": t++; break;
      case "JUSTIFICADO": j++; break;
    }
  });
  
  this.kpiPresente = p;
  this.kpiTarde = t;
  this.kpiAusente = au;
  this.kpiJustificado = j;

  this.dataAsistencias.push(["Presente", p / total * 100],["Ausente", au / total * 100],
  ["Tarde", t / total * 100],["Justificado", j / total * 100]);
}

// Metodo para cargar en el grafico los datos de llamados de atencion
cargarLlamados(){
  const meses: Set<number> = new Set();
  const anos: Set<number> = new Set();
  this.dataLlamados = [];

  this.llamadosFiltrados.forEach(llamado => {
    meses.add(llamado.dateReal[1])
    anos.add(llamado.dateReal[0])
    console.log("Meses: "+Array.from(meses));
    console.log("Años: "+Array.from(anos))
  });


  const mesesLlamados: number[] = Array.from(meses);
  mesesLlamados.sort((a, b) => a - b);

  const anosLlamados: number[] = Array.from(anos);
  anosLlamados.sort((a, b) => a - b);

  anosLlamados.forEach(ano => {
    mesesLlamados.forEach(mes => {
  
      var l = 0;
      var m = 0;
      var s = 0;
  
      this.llamadosFiltrados.forEach(llamado => {
        if(llamado.dateReal[1] === mes && llamado.dateReal[0] === ano){
          switch (llamado.wackeUpTypeEnum){
            case "Leve": l++; break;
            case "Moderado": m++; break;
            case "Severo": s++; break;
          }
        }
      });
  
      if (l !== 0 || m !== 0 || s !== 0){
        this.dataLlamados.push([this.convertirNumeroAMes(mes) + " - " +ano,l,m,s])
      }
    });
  });
}

cargarSelectEmpleados(){
  this.optionsEmpleados = [];
  this.empleados.forEach(empleado => {
    this.optionsEmpleados.push({label: `${empleado.fullName}`, value: `${empleado.id}`})
  });
}

// cargarTiposEmpleados(){
//   const tipos: Set<string> = new Set();

//   this.empleados.forEach(empleado => {
//     tipos.add(empleado.position);
//   });
// }

onStartDateChange(): void {
  const startDateInput: HTMLInputElement = document.getElementById('fechaInicio') as HTMLInputElement;
  const endDateInput: HTMLInputElement = document.getElementById('fechaFin') as HTMLInputElement;

  // Establecer límites de fechas
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  endDateInput.max = formattedToday;

  if (startDateInput.value) { endDateInput.min = startDateInput.value; } 
  else { endDateInput.min = ''; }

  this.loadData();
}

onEndDateChange(): void {
  const startDateInput: HTMLInputElement = document.getElementById('fechaInicio') as HTMLInputElement;
  const endDateInput: HTMLInputElement = document.getElementById('fechaFin') as HTMLInputElement;

  // Establecer límites de fechas
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  endDateInput.max = formattedToday;

  if (endDateInput.value) { startDateInput.max = endDateInput.value; } 
  else { startDateInput.max = ''; }

  this.loadData();
}

// Filtra las asistencias en funcion de los valores de los filtros
filtrarAsistencias() {
  this.asistenciasFiltradas = [];
 
  const startDateInput: HTMLInputElement = document.getElementById('fechaInicio') as HTMLInputElement;
  const endDateInput: HTMLInputElement = document.getElementById('fechaFin') as HTMLInputElement;

 // Filtrar por fecha si al menos una de las dos esta definida
  const startDate = startDateInput ? new Date(startDateInput.value) : null;
  const endDate = endDateInput ? new Date(endDateInput.value) : null;

  if (startDate && endDate && startDate > endDate) {
    //alert('La fecha de inicio no puede ser mayor que la fecha de fin.');

    startDateInput.value = '';
    endDateInput.value = '';
    return;
  }

  this.asistenciasFiltradas = this.asistencias.filter( (asistencia) => {

    const asistenciaDateParts = asistencia.date.split('/'); // Si es DD/MM/YYYY
    const asistenciaDate = new Date(
      Number(asistenciaDateParts[2]), // Año
      Number(asistenciaDateParts[1]) - 1, // Mes (0-indexado)
      Number(asistenciaDateParts[0]) // Día
    );
    return (
      (!startDate || asistenciaDate >= startDate) &&
      (!endDate || asistenciaDate <= endDate)
    );
  })

 if(this.empleadosFiltrados.length !== 0){
    this.asistenciasFiltradas = this.asistenciasFiltradas.filter(asistencia =>{
      console.log(asistencia)
      return this.empleadosFiltrados.includes(asistencia.employeeId.toString())
   })

  // this.empleadosFiltrados.forEach(element => {
  //   console.log(element);
  // });
  }
}


// Filtra los llamados en funcion de los valores de los filtros
filtrarLlamados() {
  this.llamadosFiltrados = [];

  const startDateInput: HTMLInputElement = document.getElementById('fechaInicio') as HTMLInputElement;
  const endDateInput: HTMLInputElement = document.getElementById('fechaFin') as HTMLInputElement;

  const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
  const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

 // Filtrar por fecha si al menos una de las dos esta definida
 if (this.fechaInicio || this.fechaFin) {
  if (startDate && endDate && startDate > endDate) {
    //alert('La fecha de inicio no puede ser mayor que la fecha de fin.');

    startDateInput.value = '';
    endDateInput.value = '';
    return;
  }

  this.llamadosFiltrados = this.llamados.filter( llamado => {
    const llamadoDate = new Date(
      Number(llamado.dateReal[0]), // Año
      Number(llamado.dateReal[1]) - 1, // Mes (0-indexado)
      Number(llamado.dateReal[2]) // Día
      );
      return (
        (!startDate || llamadoDate >= startDate) &&
        (!endDate || llamadoDate <= endDate)
      ); 
    });

    if(this.empleadosFiltrados.length !== 0){
      console.log(this.empleadosFiltrados.length)  
      this.llamadosFiltrados = this.llamadosFiltrados.filter(llamado =>{
        return this.empleadosFiltrados.includes(llamado.employeeId.toString())
     })
    }
  }
}

formatDateyyyyMMdd(dateString: string): string {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
}

 limpiarFiltro(){
   this.empleadosFiltrados = [];
   this.setInitialDates();
   this.loadData();
 }

 // Devuelve el nombre del mes en base al numero dado en el parametro
 convertirNumeroAMes(numero: number): string {
   const meses: string[] = [
     "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
     "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
   ];

   if (numero < 1 || numero > 12) {
     throw new Error("Número de mes no válido. Debe ser un valor entre 1 y 12.");
   }

   return meses[numero - 1];
 }
}
import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { ProductService } from '../../services/product.service';
import { StockAumentoService } from '../../services/stock-aumento.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { IepKpiComponent } from "../../../common-components/iep-kpi/iep-kpi.component";
interface productosFaltantes{
  producto: string,
  cantidad: number
}
@Component({
  selector: 'app-iep-charts-inventory',
  standalone: true,
  imports: [GoogleChartsModule, FormsModule, CommonModule, NgSelectModule, IepKpiComponent],
  templateUrl: './iep-charts-inventory.component.html',
  styleUrl: './iep-charts-inventory.component.css'
})
export class IepChartsInventoryComponent implements OnInit, OnDestroy { 
  
  // Servicios para obtener los datos 
  private productoService = inject(ProductService);
  private stockHistorial = inject(StockAumentoService);
  
  // Variables para guardar los distintos valores de fechas 
  fechaInicio!: string;
  fechaFin!: string;
  fechaActual: string = "";

  boolFaltantes: boolean = false;
  // listacategorias: Set<String> = new Set();

  // Listas para guardar los datos proveniente de los servicios
  productos: any[] = []
  productosFiltrados: any[] = [];
  modificaciones: any[] = [];
  modificacionesFiltradas: any[] = [];
  productosFaltantes: productosFaltantes[] = [];

  chartTypeColumnas: ChartType = ChartType.ColumnChart;
  chartTypeLinea: ChartType = ChartType.LineChart;
  chartTypeBarras: ChartType = ChartType.BarChart;
  
  dataHistorial: any[] = [];
  dataProductos: any[] = [];
  dataEstadosProductos: any[] = [];
  dataProductosFaltantes: any[] = [];

  optionsProductos: any[] = [];

  kpiTotalMovimientos: number = 0;
  kpiTotalMovimientosAumento: number = 0;
  kpiTotalMovimietnosDisminucion: number = 0;

  chartOptionsHistorial = {
    colors: ['#008000', '#FF0000'],
    animation: { duration: 1000, easing: 'out', startup: true },
  };

  columnsProductos= ['Producto','Aumento','Disminucion']
  chartOptionsProductos = {
    colors: ['#008000','#FF0000'],
    animation: { duration: 1000, easing: 'out', startup: true },
  };

  chartOptionsProductosFaltantes = {
    colors: ['#800000'],
    animation: { duration: 1000, easing: 'out', startup: true },
  };

  ngOnInit(): void {
    this.loadProductos();
    this.loadMovimientos();
    this.initializeDates();
    this.setInitialDates();
  }

  initializeDates(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    this.fechaInicio = this.formatInitialFilterDates(thirtyDaysAgo);
    this.fechaFin = this.formatInitialFilterDates(today);
    this.fechaActual = this.formatCurrentDay(today);
  }

  private formatInitialFilterDates(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatCurrentDay(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
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

    console.log("StartDate"+startDateInput.value)
    console.log("EndDate"+endDateInput.value)
  }
  
  loadProductos(){
    const empSubscription = this.productoService.getAllProducts().subscribe({
      next: (Productos) =>{
         this.productos = [];
         this.productos = Productos;
         this.cargarProductosFaltantes();
         this.cargarSelectProductos();
      }
    })
  }

  loadMovimientos(){
    const empSubscription = this.stockHistorial.getModifications().subscribe({
      next: (Modificacion) =>{
        this.modificaciones = [];
        this.modificaciones = Modificacion;
        this.modificacionesFiltradas = Modificacion;
        this.filtrar();
        this.cargarMovimientos();
      },
      error: (err) => console.error('Error al cargar asistencias:', err)
    })
  }

  // cargarCategoriasProductos(){
  //   this.dataProductos = [];
  //   const categorias: Set<String> = new Set();
  //   this.productos.forEach(producto => {
  //     console.log(producto)
  //     categorias.add(producto.category.categoryName)
  //   });
  //   this.listacategorias = categorias;

  //   // categorias.forEach(categoria => {
  //   //   var total = 0;
      
  //   //   this.productos.forEach(producto => {
  //   //     if (categoria === producto.category.categoryName){
  //   //       total = total + producto.detailProducts.length;
  //   //     }
  //   //   });

  //   //   this.dataProductos.push([categoria, total])
  //   // });

  //   // this.cargarEstados();
  // }

  // cargarEstados(){
  //   var d = 0;
  //   var p = 0;
  //   var m = 0;

  //   this.productos.forEach(producto => {
  //     const detalles: any[] = producto.detailProducts; 
  //     detalles.forEach(detalle => {
  //       switch(detalle.state){
  //         case "Disponible": d++; break;
  //         case "Prestado": p++; break;
  //         case "Mantenimiento": m++; break;
  //       }
  //     });
  //   });

  //   const total = d + p + m;

  //   this.dataEstadosProductos = [];

  //   this.dataEstadosProductos.push(["Disponible", d / total * 100],["Prestado", p /total * 100],
  //   ["Mantenimiento", m /total * 100])
  // }

  cargarMovimientos(){
    this.dataHistorial = [];
    this.dataProductos = [];
    
    const fechas: Set<string> = new Set();
    this.modificacionesFiltradas.forEach(modificacion => {
      fechas.add(modificacion.date);
    });

    fechas.forEach(fecha => {
      var totalAumento = 0;
      var totalDisminucion = 0;

      const parts = fecha.split('/');
      const fechaSet = new Date(+parts[2], +parts[1] - 1, +parts[0]);
      
      this.modificaciones.forEach(modificacion => {
        const parts = modificacion.date.split('/');
        const fechaModificacion = new Date(+parts[2], +parts[1] - 1, +parts[0]);
  
        if (fechaSet.getDate() === fechaModificacion.getDate() && 
            fechaSet.getMonth() === fechaModificacion.getMonth() &&
            fechaSet.getFullYear() === fechaModificacion.getFullYear()) {
            switch (modificacion.modificationType){
              case 'Aumento': totalAumento = totalAumento + modificacion.amount; break;
              case 'Disminución': totalDisminucion = totalDisminucion + modificacion.amount; break;
          }
        }
      });
      // console.log("Mov"+fecha,totalAumento,totalDisminucion)
      this.dataHistorial.push([fecha,totalAumento,totalDisminucion]);
    });

    const producto: Set<String> = new Set();
    var totalProductos: number = 0
    this.modificacionesFiltradas.forEach(modificacion => {
      producto.add(modificacion.product);
      totalProductos = totalProductos + modificacion.amount;
    });

    producto.forEach(producto => {
      var totalAumentoProducto = 0;
      var totalDisminucionProducto = 0;

      this.modificacionesFiltradas.forEach(modificacion => {
        if (producto === modificacion.product && modificacion.modificationType === 'Aumento') {totalAumentoProducto += modificacion.amount}
        if (producto === modificacion.product && modificacion.modificationType === 'Disminución') {totalDisminucionProducto += modificacion.amount}
      });

      this.dataProductos.push([producto,totalAumentoProducto,totalDisminucionProducto]);
    });
      

    //modificacionesFiltradas.forEach(modificacion => {
      //console.log(modificacion.date)
      //this.dataHistorial.push(new Date(modificacion.date), modificacion.amount)
    //});

    //const categoria: Set<string> = new Set();
    //this.modificaciones.forEach(modificacion => {
   //   console.log(modificacion);
      //categoria.add(modificacion.product)
   // });
    //this.columnNames.push("Categoria")
    //categoria.forEach(categoria => {
    //  this.columnNames.push(categoria);
    // });
  }

  cargarProductosFaltantes(){
    this.dataProductosFaltantes = [];
    this.productos.forEach(producto => {
     
      const stock = producto.stock;
      const cantMin = producto.minQuantityWarning;
      const total = stock - cantMin;

      if(total <= 0){
        var faltante: productosFaltantes = {
          producto: producto.name,
          cantidad: (total * -1) + 1
        }
  
        this.productosFaltantes.push(faltante)

        this.dataProductosFaltantes.push([producto.name,faltante.cantidad])
      }
    });

    this.productosFaltantes = this.productosFaltantes
    .sort((a, b) => b.cantidad - a.cantidad) // Ordenar de mayor a menor
    .slice(0, 5); // Tomar solo los primeros 5 elementos
  }

  cargarSelectProductos(){
    this.optionsProductos = [];
    this.productos.forEach(producto => {
      this.optionsProductos.push({label: `${producto.name}`, value: `${producto.name}`})
    });
  }

  onStartDateChange(): void {
    const startDateInput: HTMLInputElement = document.getElementById('fechaInicio') as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById('fechaFin') as HTMLInputElement;

    // Establecer límites de fechas
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    endDateInput.max = formattedToday;

    if (startDateInput.value) { endDateInput.min = startDateInput.value; } 
    else { endDateInput.min = ''; }

    this.loadMovimientos();
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

    this.loadMovimientos();
  }

  filtrar(){
    this.modificacionesFiltradas = [];

    const startDateInput: HTMLInputElement = document.getElementById('fechaInicio') as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById('fechaFin') as HTMLInputElement;

    const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
    const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
    
    if (startDate && endDate && startDate > endDate) {
      //alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
  
      startDateInput.value = '';
      endDateInput.value = '';
      return;
    }

    this.modificacionesFiltradas = this.modificaciones.filter((modificacion) => {
      console.log(modificacion)
      const productDate = new Date(this.formatDateyyyyMMdd(modificacion.date));
      return (
        (!startDate || productDate >= startDate) &&
        (!endDate || productDate <= endDate)
      );
    });

     if (this.productosFiltrados.length !== 0) {
        this.modificacionesFiltradas = this.modificacionesFiltradas.filter( modificacion => {
          console.log(modificacion)
          return this.productosFiltrados.includes(modificacion.product)
        })
      }

      this.productosFiltrados.forEach(element => {
        console.log("Productos filtro"+element)
      });

    console.log(this.modificacionesFiltradas);
    this.cargarKpi();
  }

  formatDateyyyyMMdd(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }

  limpiarFiltro(){
    this.productosFiltrados = [];
    this.setInitialDates();
    this.loadMovimientos();
  }

  cargarKpi(){
    this.kpiTotalMovimientos = this.modificacionesFiltradas.length;

    var totalProductosAumento = 0;
    var totalProductosDisminucion = 0;

    this.modificacionesFiltradas.forEach(modificacion => {
      if (modificacion.modificationType === 'Aumento') {totalProductosAumento += modificacion.amount}
      if (modificacion.modificationType === 'Disminución') {totalProductosDisminucion += modificacion.amount}
    });

    this.kpiTotalMovimientosAumento = totalProductosAumento;
    this.kpiTotalMovimietnosDisminucion = totalProductosDisminucion;
  }

  cambiarVista(){
    if (this.boolFaltantes) {this.boolFaltantes = false}
    else this.boolFaltantes = true;
  }

  ngOnDestroy(): void {
    this.dataEstadosProductos = [];
    this.dataHistorial = [];
    this.dataProductos = []
    this.productosFaltantes = [];
  }

}
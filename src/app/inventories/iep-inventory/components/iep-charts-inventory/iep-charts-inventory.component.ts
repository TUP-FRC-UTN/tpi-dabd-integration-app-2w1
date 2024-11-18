import { Component, inject, OnInit } from '@angular/core';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { ProductService } from '../../services/product.service';
import { StockAumentoService } from '../../services/stock-aumento.service';

@Component({
  selector: 'app-iep-charts-inventory',
  standalone: true,
  imports: [GoogleChartsModule],
  templateUrl: './iep-charts-inventory.component.html',
  styleUrl: './iep-charts-inventory.component.css'
})
export class IepChartsInventoryComponent implements OnInit {
  private productoService = inject(ProductService);
  private stockHistorial = inject(StockAumentoService);
  
  productos: any[] = []
  modificaciones: any[] = [];

  chartTypeProductos: ChartType = ChartType.ColumnChart;
  dataProductos: any[] = [];
  columnNamesProductos = ['Producto', 'Cantidad'];
  chartOptionsProductos = {
    title: 'Productos',
    colors: ['#28a745'],
  };

  chartTypeEstadosProductos: ChartType = ChartType.PieChart;
  dataEstadosProductos: any[] = [];
  columnNamesEstadosProductos = ['Estado', 'Porcentaje'];
  chartOptionsEstadosProductos = {
    title: 'Estado productos',
    colors: ['#28a745', '#dc3545', '#ffc107']
  };

  chartTypeHistorial: ChartType = ChartType.LineChart;
  dataHistorial: any[] = [];
  columnNamesHistorial = ['Fecha', 'Cantidad'];
  chartOptionsHistorial = {
    title: 'Historial productos',
    colors: ['#0000FF', '#FF0000', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF']
  };

  width = 800;
  height = 800;

  ngOnInit(): void {
    this.loadProductos();
    this.loadHistorial();
  }

  loadProductos(){
    const empSubscription = this.productoService.getAllProducts().subscribe({
      next: (Productos) =>{
         this.productos = [];
         this.productos = Productos;
         this.cargarProductos();
        }
      })
  }

  loadHistorial(){
    const empSubscription = this.stockHistorial.getModifications().subscribe({
      next: (Modificacion) =>{
        this.modificaciones = [];
        this.modificaciones = Modificacion;
        this.cargarModificaciones();
      },
    })
  }

  cargarProductos(){
    this.dataProductos = [];
    const categorias: Set<String> = new Set();
    this.productos.forEach(producto => {
      categorias.add(producto.category.categoryName)
    });
    
    categorias.forEach(categoria => {
      var total = 0;
      
      this.productos.forEach(producto => {
        if (categoria === producto.category.categoryName){
          total = total + producto.detailProducts.length;
        }
      });

      this.dataProductos.push([categoria, total])
    });

    this.cargarEstados();
  }

  cargarEstados(){
    var d = 0;
    var p = 0;
    var m = 0;

    this.productos.forEach(producto => {
      const detalles: any[] = producto.detailProducts; 
      detalles.forEach(detalle => {
        switch(detalle.state){
          case "Disponible": d++; break;
          case "Prestado": p++; break;
          case "Mantenimiento": m++; break;
        }
      });
    });

    const total = d + p + m;

    this.dataEstadosProductos = [];

    this.dataEstadosProductos.push(["Disponible", d / total * 100],["Prestado", p /total * 100],
    ["Mantenimiento", m /total * 100])
  }

  cargarModificaciones(){

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 31);
    const fechas: Set<Date> = new Set();
    
    this.modificaciones.forEach(modificacion => {
      const parts = modificacion.date.split('/');
      const fechaModificacion = new Date(+parts[2], +parts[1] - 1, +parts[0]);
      fechas.add(fechaModificacion);
    });

    this.dataHistorial = [];
    fechas.forEach(fecha => {
      var total = 0;
      this.modificaciones.forEach(modificacion => {
        const parts = modificacion.date.split('/');
        const fechaModificacion = new Date(+parts[2], +parts[1] - 1, +parts[0]);
  
        if (fecha.getDate() === fechaModificacion.getDate() && 
            fecha.getMonth() === fechaModificacion.getMonth()) {
            switch (modificacion.modificationType){
              case 'Aumento': total = total + modificacion.amount; break;
              case 'Disminución': total = total - modificacion.amount; break;
          }
        }
      });
      
      this.dataHistorial.push([fecha,total]);
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

}

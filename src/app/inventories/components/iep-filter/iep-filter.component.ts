import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-iep-filter',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './iep-filter.component.html'
})
export class IepFilterComponent {
  @Output() filtroAplicado = new EventEmitter<{ desde: string, hasta: string, busqueda: string }>();
  @Output() filtrosEliminados = new EventEmitter<void>();
  @Input() productos: string[] = [];

  desde: string = '';
  hasta: string = '';
  busqueda: string = '';
  error: string = '';
  caracteresMinimosBusqueda: number = 3; // Número mínimo de caracteres para la búsqueda

  constructor(private productService: ProductService) {
    this.setUltimoMes();
  }

  setUltimoMes() {
    const hoy = new Date();
    const ultimoMes = new Date();
    ultimoMes.setMonth(hoy.getMonth() - 1);

    this.desde = ultimoMes.toISOString().split('T')[0];
    this.hasta = hoy.toISOString().split('T')[0];
  }

  onInputChange() {
    const fechaDesde = new Date(this.desde);
    const fechaHasta = new Date(this.hasta);

    if (this.desde && this.hasta && fechaHasta < fechaDesde) {
        this.error = 'La fecha "hasta" no puede ser anterior a la fecha "desde".';
        return;
    }
    if (this.busqueda.length < this.caracteresMinimosBusqueda) {
      // Aquí puedes limpiar el filtro o emitir un valor vacío
      this.filtroAplicado.emit({
          desde: this.desde,
          hasta: this.hasta,
          busqueda: ''
      });
      this.error = '';
      return;
  }

    this.error = '';
    this.filtroAplicado.emit({
        desde: this.desde,
        hasta: this.hasta,
        busqueda: this.busqueda
    });
  }

  onSubmit() {
    this.onInputChange();
  }

  eliminarFiltros() {
    this.setUltimoMes();
    this.busqueda = '';
    this.error = '';
    this.filtrosEliminados.emit();
  }
}
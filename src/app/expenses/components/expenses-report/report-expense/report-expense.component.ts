import { Component, OnInit } from '@angular/core';
import { GoogleChartInterface, Ng2GoogleChartsModule } from 'ng2-google-charts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseReportService } from '../../../services/expenseReportServices/expense-report.service';
import { ExpenseData } from '../../../models/expenseReportModel/ExpenseData';
import { CategoryData } from '../../../models/expenseReportModel/CategoryData';

@Component({
  standalone: true,
  selector: 'app-report-expense',
  imports: [CommonModule, FormsModule, Ng2GoogleChartsModule],
  templateUrl: './report-expense.component.html',
  styleUrls: ['./report-expense.component.scss']
})
export class ReportExpenseComponent implements OnInit {

  // Gráfico combinado para comparar gastos por año
  public comboChart: GoogleChartInterface = {
    chartType: 'ComboChart',
    dataTable: [['Month', 'Año Anterior', 'Año Actual']],
    options: {
      title: 'Comparación de Gastos por Año y Mes',
      vAxis: {
        title: 'Monto ($)',
        minValue: 0,
        textStyle: { fontSize: 12, color: '#555' }
      },
      seriesType: 'bars',
      series: {
        0: { color: '#1f77b4', type: 'bars' },
        1: { color: '#ff7f0e', type: 'bars' }
      },
      bar: { groupWidth: '75%' },
      legend: {
        position: 'right',
        alignment: 'center',
        textStyle: { fontSize: 14 }
      },
      chartArea: { width: '70%', height: '70%' },
      backgroundColor: '#f9f9f9',
      titleTextStyle: {
        color: '#333',
        fontSize: 16,
        bold: true
      }
    }
  };

  // Gráfico de anillos para mostrar distribución de gastos por categoría
  public donutChart: GoogleChartInterface = {
    chartType: 'PieChart',
    dataTable: [
      ['Category', 'Amount'],
    ],
    options: {
      title: 'Gastos por Categoría',
      legend: {
        position: 'right',
        alignment: 'center',
        textStyle: { fontSize: 12 }
      },
      pieSliceText: 'percentage',
      pieSliceTextStyle: {
        fontSize: 12,
        color: '#fff'
      },
      chartArea: {
        left: '15%',
        top: '10%',
        width: '70%',
        height: '80%'
      },
      slices: {
        0: { offset: 0.05 },
        1: { offset: 0.05 },
        2: { offset: 0.05 },
        3: { offset: 0.05 },
        4: { offset: 0.05 }
      },
      tooltip: {
        showColorCode: true
      },
      titleTextStyle: {
        fontSize: 16,
        bold: true,
        color: '#333'
      },
      pieStartAngle: 45,
      backgroundColor: '#f9f9f9'
    }
  };

  startDate: string = '2024-01-01';  // Fecha por defecto
  endDate: string = '2024-12-31';    // Fecha por defecto
  isLoading: boolean = false;

  constructor(private expenseReportService: ExpenseReportService) { }

  ngOnInit() {
    this.updateCharts();
  }

  // Función para actualizar ambos gráficos
  updateCharts() {
    this.updateComboChart();
    this.updateDonutChart();
  }

  // Actualiza el gráfico combinado
  updateComboChart() {
    this.isLoading = true;

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    this.comboChart = {
      ...this.comboChart,
      dataTable: [['Mes', `${new Date(this.startDate).getFullYear()}`, `${new Date(this.endDate).getFullYear()}`]]
    };

    setTimeout(() => {
      this.expenseReportService.getExpenseData(this.startDate, this.endDate).subscribe((data: ExpenseData[]) => {
        const chartData: any[] = [['Mes', `${new Date(this.startDate).getFullYear()}`, `${new Date(this.endDate).getFullYear()}`]];
        const groupedData: { [key: number]: { [key: number]: number } } = {};

        data.forEach((item) => {
          if (!groupedData[item.month]) {
            groupedData[item.month] = {};
          }
          groupedData[item.month][item.year] = item.amount;
        });

        for (let month = 1; month <= 12; month++) {
          const previousYearAmount = groupedData[month]?.[new Date(this.startDate).getFullYear()] || 0;
          const currentYearAmount = groupedData[month]?.[new Date(this.endDate).getFullYear()] || 0;
          chartData.push([monthNames[month - 1], previousYearAmount, currentYearAmount]);
        }

        this.comboChart = {
          ...this.comboChart,
          dataTable: chartData
        };

        this.isLoading = false;
      });
    }, 1000);
  }

  // Actualiza el gráfico de anillos
  updateDonutChart() {
    this.isLoading = true;

    // Reiniciar el gráfico antes de cargar nuevos datos
    this.donutChart = {
      ...this.donutChart,
      dataTable: [['Categoría', 'Monto']]
    };

    setTimeout(() => {
      this.expenseReportService.getCategoryData(this.startDate, this.endDate).subscribe((data: CategoryData[]) => {
        const chartData: any[] = [['Categoría', 'Monto']];
        data.forEach((item) => {
          chartData.push([item.category, item.amount]);
        });

        this.donutChart = {
          ...this.donutChart,
          dataTable: chartData
        };

        this.isLoading = false;
      });
    }, 1000);
  }

  // Obtener nombre del mes
  getMonthName(month: number): string {
    const date = new Date();
    date.setMonth(month - 1);
    return date.toLocaleString('default', { month: 'long' });
  }

  // Cambia las fechas y actualiza los gráficos
  onDateChange() {
    if (this.startDate && this.endDate) {
      this.updateCharts();
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccessReportHoodComponent } from '../access_report_to_hood/access-report-hood/access-report-hood.component';
import { AccessReportNeighboorComponent } from '../access-report_to_neighbor/access-report-neighboor/access-report-neighboor.component';

@Component({
  selector: 'access-app-global-report',
  standalone: true,
  imports: [CommonModule, FormsModule, AccessReportNeighboorComponent, AccessReportHoodComponent],
  templateUrl: './access-global-report.component.html',
  styleUrl: './access-global-report.component.css'
})
export class AccessGlobalReportComponent implements OnInit {
  selectedReport: string = 'hood';  // Componente por defecto
  selectedHood: boolean = true;
  selectedNeighbor: boolean = false;

  ngOnInit() {
    // Inicializa el componente por defecto
    this.selectedReport = 'hood';
    this.selectedHood = true;
    this.selectedNeighbor = false;
  }

  // Función para manejar el cambio de selección
  onCheckboxChange(reportType: string) {
    if (reportType === 'hood') {
      this.selectedHood = true;
      this.selectedNeighbor = false;
      this.selectedReport = 'hood';
    } else if (reportType === 'neighbor') {
      this.selectedNeighbor = true;
      this.selectedHood = false;
      this.selectedReport = 'neighbor';
    }
  }
  

}

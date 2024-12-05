import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccessReportNeighboorComponent } from '../entries-report_to_neighbor/access-report-neighboor/access-report-neighboor.component';
import { AccessRegisterEmergencyComponent } from "../../access-register-emergency/access-register-emergency.component";

@Component({
  selector: 'access-app-global-report',
  standalone: true,
  imports: [CommonModule, FormsModule, AccessReportNeighboorComponent, AccessRegisterEmergencyComponent],
  templateUrl: './access-global-report.component.html',
  styleUrl: './access-global-report.component.css'
})
export class AccessGlobalReportComponent implements OnInit {

  selectedHood: boolean = true;
  selectedNeighbor: boolean = false;

  ngOnInit() {
    // Inicializa el componente por defecto

    this.selectedHood = true;
    this.selectedNeighbor = false;
  }

  // Función para manejar el cambio de selección
  onCheckboxChange(reportType: string) {
    if (reportType === 'hood') {
      this.selectedHood = true;
      this.selectedNeighbor = false;

    } else if (reportType === 'neighbor') {
      this.selectedNeighbor = true;
      this.selectedHood = false;

    }
  }


}

import { Component } from '@angular/core';
import { AccessAreachartComponent } from "../access-areachart/access-areachart.component";
import { AccessDashboardComponent } from '../access-dashboard/access-dashboard.component';
import { AccessPiechartComponent } from '../access-piechart/access-piechart.component';

@Component({
  selector: 'access-app-general-dashboard',
  standalone: true,
  imports: [AccessAreachartComponent, AccessPiechartComponent, AccessDashboardComponent],
  templateUrl: './access-general-dashboard.component.html',
  styleUrl: './access-general-dashboard.component.css'
})
export class AccessGeneralDashboardComponent {

}

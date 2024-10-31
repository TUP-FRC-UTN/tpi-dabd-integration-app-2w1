import { Component } from '@angular/core';
import { AccessDailyFetchComponent } from "../access-daily-fetch/access-daily-fetch.component";
@Component({
  selector: 'access-app-entry',
  standalone: true,
  imports: [AccessDailyFetchComponent],
  templateUrl: './access-entry.component.html',
  styleUrl: './access-entry.component.css'
})
export class AccessEntryComponent {
  title = 'Ingresos';
}

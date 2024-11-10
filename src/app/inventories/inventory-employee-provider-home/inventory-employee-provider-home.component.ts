import { Component } from '@angular/core';
import { MOCKUsersNavbarComponent } from '../common-components/users-navbar/users-navbar.component';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-inventory-employee-provider-home',
  standalone: true,
  imports: [RouterModule, RouterOutlet, MOCKUsersNavbarComponent],
  
  templateUrl: './inventory-employee-provider-home.component.html',
  styleUrl: './inventory-employee-provider-home.component.scss'
})
export class InventoryEmployeeProviderHomeComponent {

}

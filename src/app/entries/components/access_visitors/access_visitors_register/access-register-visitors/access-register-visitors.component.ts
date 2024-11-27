import { Component } from '@angular/core';
import { AccessContainerVisitorsRegistrationComponent } from '../access-container-visitors-registration/access-container-visitors-registration.component';
import { AccessVisitorsEventualComponent } from '../../acceses-visitors-eventual/access-visitors-eventual/access-visitors-eventual.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-access-register-visitors',
  standalone: true,
  imports: [AccessContainerVisitorsRegistrationComponent,AccessVisitorsEventualComponent, FormsModule],
  templateUrl: './access-register-visitors.component.html',
  styleUrl: './access-register-visitors.component.css'
})
export class AccessRegisterVisitorsComponent {
    selectedComponent: 'registration' | 'eventual' = 'eventual';
}


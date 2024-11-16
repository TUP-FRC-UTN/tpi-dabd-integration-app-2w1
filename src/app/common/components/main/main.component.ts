import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UsersNavbarComponent } from "../users-navbar/users-navbar.component";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, UsersNavbarComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}

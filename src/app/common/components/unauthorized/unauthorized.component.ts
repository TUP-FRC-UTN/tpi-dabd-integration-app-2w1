import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoutingService } from '../../services/routing.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent implements OnInit {

  timeLeft: number = 5; // Segundos para la cuenta regresiva
  intervalId: any; // Guardará el ID del intervalo

  constructor(private routingService : RoutingService) { }

   startCountdown(): void {
    this.intervalId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.intervalId);
        this.routingService.redirect('/main/home', 'Página principal');
      }
    }, 1000);

  }
  
  ngOnInit(): void {
    this.startCountdown();
  }
}

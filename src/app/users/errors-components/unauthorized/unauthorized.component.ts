import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) { }

   startCountdown(): void {
    this.intervalId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.intervalId); // Detenemos el intervalo
        this.router.navigate(['home']);
      }
    }, 1000); // Cada segundo

  }
  
  ngOnInit(): void {
    this.startCountdown();
  }
}

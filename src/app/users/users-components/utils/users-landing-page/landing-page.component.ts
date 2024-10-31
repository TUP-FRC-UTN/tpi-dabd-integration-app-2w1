import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { NavbarComponent } from '../users-navbar/navbar.component';
import { ModalInfoUserComponent } from '../../users/users-modal-info-user/modal-info-user.component';
import { RouterOutlet } from '@angular/router';
import { UsersSelectMultipleComponent } from '../../utils/users-select-multiple/users-select-multiple.component';
import { LoginService } from '../../../users-servicies/login.service';
import { FileService } from '../../../users-servicies/file.service';
import { AuthService } from '../../../users-servicies/auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterOutlet, ModalInfoUserComponent, NavbarComponent, UsersSelectMultipleComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],  // Corrige 'styleUrl' a 'styleUrls'
})
export class LandingPageComponent implements OnInit, OnDestroy {

  private intervalId!: ReturnType<typeof setInterval>; // Corrige el tipo de intervalId

  private readonly file: FileService = inject(FileService);
  private readonly authService: AuthService = inject(AuthService);

  ngOnInit(): void {
    // Inicia el intervalo al inicializar el componente
    this.intervalId = setInterval(() => this.currentTime(), 1000);
  }

  ngOnDestroy(): void {
    // Limpia el intervalo cuando se destruye el componente
    clearInterval(this.intervalId);
  }

  downloadTmpFile(): void {
    // Cambia 'fileId123' por el identificador del archivo deseado
    this.file.downloadFile('88673b48-49c3-4e41-bbf4-20294dde51c9');
  }

  getUserName(): string {
    const user = this.authService.getUser();
    return `${user.name} ${user.lastname}`;
  }

  currentTime(): string {
    const date = new Date();
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }
}
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../users-servicies/user.service';
import { LoginUser } from '../../../users-models/users/Login';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../../users-servicies/login.service';
import { AuthService } from '../../../users-servicies/auth.service';
import { UserLoged } from '../../../users-models/users/UserLoged';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly apiService = inject(UserService);
  private readonly authService = inject(AuthService);
  passwordVisible: boolean = false;

  //Muestra un mensaje si los datos ingresados son incorrectos
  errorLog: boolean = false;

  //Establece los campos del formulario
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  //Funcion para cambiar la visibilidad de la contraseña
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  //Funcion para loguear, setear el token y redirigir a la pagina de inicio
  async login() {
    this.apiService.verifyLogin(this.loginForm.value as LoginUser).subscribe({
      next: async (data) => {
        await this.authService.login(data);
        this.errorLog = false;
        this.router.navigate(['home']);
      
      },
      error: (error) => {
        this.errorLog = true;
      },
    });
  }
}

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
import { ValidatorsService } from '../../../users-servicies/validators.service';

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
  private readonly validatorService = inject(ValidatorsService)
  passwordVisible: boolean = false;

  //Muestra un mensaje si los datos ingresados son incorrectos
  errorLog: boolean = false;

  //Establece los campos del formulario
  reactiveForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.maxLength(50)]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  //Funcion para cambiar la visibilidad de la contraseña
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onValidate(controlName: string) {
    const control = this.reactiveForm.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }

  showError(controlName: string): string {
    const control = this.reactiveForm.get(controlName);
  
    // Solo mostrar errores si el control ha sido tocado o modificado
    if (control && control.errors && (control.touched || control.dirty)) {
      const [errorKey] = Object.keys(control.errors);
  
      switch (errorKey) {
        case 'required':
          return 'Este campo no puede estar vacío.';
        case 'minlength':
          return `Valor ingresado demasiado corto. Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `Valor ingresado demasiado largo. Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
        default:
          return 'Error no identificado en el campo.';
      }
    }
  
    // Retorna cadena vacía si no hay errores o el control no ha sido tocado o modificado.
    return '';
  }

  //Funcion para loguear, setear el token y redirigir a la pagina de inicio
  async login() {
    this.apiService.verifyLogin(this.reactiveForm.value as LoginUser).subscribe({
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

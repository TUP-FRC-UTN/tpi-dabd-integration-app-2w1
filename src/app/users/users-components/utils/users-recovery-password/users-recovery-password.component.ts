import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users-recovery-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './users-recovery-password.component.html',
  styleUrl: './users-recovery-password.component.css'
})
export class UsersRecoveryPasswordComponent {

  private readonly router = inject(Router);


  recoveryForm = new FormGroup({
    email : new FormControl('',[Validators.required])
  })

  //El método debe conectarse con Notificaciones 
  //para enviar al email suministrado una contraseña o token provisorio
  sendMail() {
    this.router.navigate(['login']);
  }

  backLogin(){
    this.router.navigate(['login'])
  }

}

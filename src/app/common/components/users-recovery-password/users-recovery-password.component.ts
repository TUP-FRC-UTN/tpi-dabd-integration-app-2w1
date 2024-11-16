import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecoveryPasswordService } from '../../../users-servicies/recoveryPassword.service';

@Component({
  selector: 'app-users-recovery-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './users-recovery-password.component.html',
  styleUrl: './users-recovery-password.component.css'
})
export class UsersRecoveryPasswordComponent {

  private readonly router = inject(Router);
  private recoveryService = inject(RecoveryPasswordService);
  send: boolean = false;


  recoveryForm = new FormGroup({
    email : new FormControl('',[Validators.required])
  })

  //El método debe conectarse con Notificaciones 
  //para enviar al email suministrado una contraseña o token provisorio
  sendMail() {
    this.recoveryService.recoveryPassword(this.recoveryForm.get('email')!.value!).subscribe({
      next: (data) => {
        this.send = true;
      },
      error: (err) => {
        this.send = true;
    }})
  }

  backLogin(){
    this.router.navigate(['login'])
  }

}

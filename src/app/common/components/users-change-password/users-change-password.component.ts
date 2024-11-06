import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../users/users-servicies/user.service';
import { AuthService } from '../../../users/users-servicies/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users-change-password.component.html',
  styleUrl: './users-change-password.component.css'
})
export class UsersChangePasswordComponent {

  
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
@Component({
  selector: 'app-iep-register-warehouse',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './iep-register-warehouse.component.html',
  styleUrl: './iep-register-warehouse.component.css'
})
export class IepRegisterWarehouseComponent {
  
  constructor() {
  }

  onSubmit(form: NgForm) {

    
  }
}

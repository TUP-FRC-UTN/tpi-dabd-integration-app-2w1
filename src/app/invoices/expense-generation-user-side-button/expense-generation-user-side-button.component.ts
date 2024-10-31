import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SideButton } from '../expense-generation-interfaces/expense-generation-sidebutton';

@Component({
  selector: 'app-expense-generation-user-side-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-generation-user-side-button.component.html',
  styleUrl: './expense-generation-user-side-button.component.css'
})
export class ExpenseGenerationUserSideButtonComponent {

  //Expandir o cerrar
  @Input() expanded: boolean = false;

  //Botones
  @Input() info: SideButton = new SideButton();

  //Rol del usuario logeado
  @Input() userRole: string = "";

  @Output() sendTitle = new EventEmitter<string>();

  constructor(private route: Router) {
  }


  redirect(path: string, titleFather: string, titleChild: string) {
    if (titleChild == '') {
      this.sendTitle.emit(`${titleChild} ${titleFather}`);
      this.route.navigate([path]);
    }
    else {
      this.sendTitle.emit(`${titleChild} ${titleFather.toLowerCase()}`);
      this.route.navigate([path]);
    }
  }

  // redirect(path : string, title : string){
  //   this.sendTitle.emit(title);
  //   this.route.navigate([path]);
  // }

}

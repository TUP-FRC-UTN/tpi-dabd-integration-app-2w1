import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SideButton } from '../../models/sideButton';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expenses-side-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expenses-side-button.component.html',
  styleUrl: './expenses-side-button.component.scss'
})
export class ExpensesSideButtonComponent {
  //Expandir o cerrar
  @Input() expanded : boolean = false;

  //Botones
  @Input() info : SideButton = new SideButton();

  //Rol del usuario logeado
  @Input() userRoles : string[] = [];

  @Output() sendTitle = new EventEmitter<string>();

  constructor(private route : Router){
  }

  redirect(path : string, title : string){
    this.sendTitle.emit(title);
    this.route.navigate([path]);
  }
}

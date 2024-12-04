import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SideButton } from '../../models/SideButton';
import { CommonModule } from '@angular/common';
import { RoutingService } from '../../services/routing.service';

@Component({
  selector: 'app-users-side-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-side-button.component.html',
  styleUrl: './users-side-button.component.css'
})
export class UsersSideButtonComponent {

  //Expandir o cerrar
  @Input() expanded: boolean = false;

  //Botones
  @Input() info: SideButton = new SideButton();

  //Rol del usuario logeado
  @Input() userRole: string = "";

  @Output() sendInfo = new EventEmitter<any>();

  send(path: string, title: string) {
    this.sendInfo.emit({ path: path, title: title });
  }
  
  
}
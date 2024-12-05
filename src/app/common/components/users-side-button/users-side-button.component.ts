import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
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
  //Maneja el ciclo de vida del componente
  showComponent = true;

  //Expandir o cerrar
  @Input() expanded: boolean = false;

  //Botones
  @Input() info: SideButton = new SideButton();

  //Rol del usuario logeado
  @Input() userRole: string = "";

  //Activa la emision de datos
  @Output() sendInfo = new EventEmitter<any>();


  //Detecta cambios en el rol del usuario
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userRole'] && this.info.childButtons) {
        console.log(`Actualizando side button "${this.info.name}"`);
        
        this.resetComponent();
    }
  }

  
  //Envia la info al padre para la redireccion
  send(path: string, title: string) {
    this.sendInfo.emit({ path: path, title: title });
  }


  //Reinicia el componente
  resetComponent() {
    this.showComponent = false;
    setTimeout(() => this.showComponent = true, 0); //Pone un delay para que se reinicie
  }


}
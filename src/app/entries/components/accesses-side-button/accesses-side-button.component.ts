import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SideButton } from '../../models/navbar/SideButton';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accesses-side-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accesses-side-button.component.html',
  styleUrl: './accesses-side-button.component.css'
})
export class AccessesSideButtonComponent {
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

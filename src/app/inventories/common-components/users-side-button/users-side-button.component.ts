import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SideButton } from '../../common-models/SideButton';

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

  @Output() sendTitle = new EventEmitter<string>();

  constructor(private route: Router) {
  }


  redirect(path: string, titleFather: string, titleChild: string) {
    if (titleChild == '') {
      this.sendTitle.emit(`${titleChild} ${titleFather}`);
      this.route.navigate([path]);
    }
    else {
      this.sendTitle.emit(`${titleChild}`);
      this.route.navigate([path]);
    }
  }

  // redirect(path : string, title : string){
  //   this.sendTitle.emit(title);
  //   this.route.navigate([path]);
  // }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockUserService {
  //este service es temporal para poder utilizar el guardROL
  rolActual:string |null = null


  constructor() { 
    this.rolActual = localStorage.getItem('rolActual');
  }

  setRol(rol:string){
    this.rolActual = rol;
    localStorage.setItem('rolActual', rol); // Guardar el rol en localStorage
    console.log(this.rolActual);
  }
  getRol(){
    return this.rolActual
  }
  isAdmin(): boolean {
    return this.rolActual === 'Admin';
  }

}

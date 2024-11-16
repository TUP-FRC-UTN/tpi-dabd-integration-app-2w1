import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsersMockIdService {

  constructor() { }

  getMockId(): number {
    //encuentra el id del usuario logueado -> encargado de inv o encargado de empleados
    return 1;
  }


}

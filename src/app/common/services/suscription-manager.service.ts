import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SuscriptionManagerService {

  private suscriptions : Subscription[] = [];
  
  //Añadir una suscripción
  addSuscription(suscription: Subscription){
    this.suscriptions.push(suscription);
  }

  //Desuscribirse de todos los observables
  unsubscribeAll(){
    this.suscriptions.forEach(suscription => {
      suscription.unsubscribe();
    });

    //Vaciar array
    this.suscriptions = [];
  }
}

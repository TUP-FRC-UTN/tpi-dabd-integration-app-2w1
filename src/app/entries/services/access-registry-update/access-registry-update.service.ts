import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessRegistryUpdateService {
  private registryBehaviorSubject = new BehaviorSubject<boolean>(true);

  constructor() { }

  updateTable(forceUpdate: boolean): void {
    this.registryBehaviorSubject.next(forceUpdate);
  }
  
  getObservable(): Observable<boolean> {
    return this.registryBehaviorSubject.asObservable();
  }
}

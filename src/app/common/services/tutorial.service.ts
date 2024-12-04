import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  private tutorialTrigger = new Subject<void>();
  
  tutorialTrigger$ = this.tutorialTrigger.asObservable();

  triggerTutorial() {
    this.tutorialTrigger.next();
  }
}
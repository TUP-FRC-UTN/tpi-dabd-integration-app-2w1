import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appAccessAutosizeTextarea]',
  standalone: true
})
export class AccessAutosizeTextareaDirective {

  private initialHeight = '100%'; 

  constructor(private el: ElementRef) {
    this.setInitialHeight(); // establecer la altura inicial
    //this.adjustSize(); // ajustar el tamaño si es necesario
  }

  // escucha el evento 'input' para ajustar la altura (cuando el contenido cambia)
  @HostListener('input', ['$event.target'])
  onInput(): void {
    this.adjustSize();
  }

  private setInitialHeight(): void {
    const textarea = this.el.nativeElement;
    textarea.style.height = this.initialHeight; // establece la altura inicial
  }

  private adjustSize(): void {
    const textarea = this.el.nativeElement;
    textarea.style.overflow = 'hidden'; // esconde el scroll
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`; // ajusta la altura
  }

}

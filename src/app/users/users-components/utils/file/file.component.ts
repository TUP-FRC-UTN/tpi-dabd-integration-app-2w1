import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-file',
  standalone: true,
  imports: [],
  templateUrl: './file.component.html',
  styleUrl: './file.component.css'
})
export class FileComponent {
  @Input() index:number=0
  @Input() file!: File
  @Output() selected = new EventEmitter<number>();

  deleteImg(){
    this.selected.emit(this.index)
  }

}
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FileComponent } from '../file/file.component';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [FileComponent,CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent implements OnInit {
  files: File[] = [];
  @Input() filesLoaded?: File[] = [];
  @Output() filesChange = new EventEmitter<File[]>();
  @ViewChild('fileUpload') fileInput!: ElementRef;

  emitFiles() {
    this.filesChange.emit(this.files);
    console.log(this.files);
    
  }

  ngOnInit(): void {
    if(this.filesLoaded){
      this.files = this.filesLoaded;
      console.log(this.filesLoaded);
      console.log(this.files);
      this.emitFiles(); //agregue esto
    }
  }

  selectFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const selectedFiles = Array.from(input.files);
      this.files.push(...selectedFiles);
      this.emitFiles();
     
      // Se restablece el valor del componente del input para poder agregar archivos que se eliminaron de la lista
      this.fileInput.nativeElement.value = '';
    }
  }

  eliminateImg(index: number) {
    this.files.splice(index, 1);
  }
}
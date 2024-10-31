import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from '../../../users-servicies/auth.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.css'
})
export class ImageUploadComponent implements OnInit {
  files: File[] = [];
  @Input() filesLoaded?: File[] = [];
  @Output() filesChange = new EventEmitter<File[]>();
  @ViewChild('fileUpload') fileInput!: ElementRef;
  src: string = '';

  private readonly authService = inject(AuthService);

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
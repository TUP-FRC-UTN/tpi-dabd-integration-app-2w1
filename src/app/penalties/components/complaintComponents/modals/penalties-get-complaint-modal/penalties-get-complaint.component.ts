import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ComplaintService } from '../../../../services/complaints.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PutStateComplaintDto } from '../../../../models/complaint';
import { UserService } from '../../../../../users/users-servicies/user.service';

@Component({
  selector: 'app-penalties-modal-consult-complaint',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './penalties-get-complaint.component.html',
  styleUrl: './penalties-get-complaint.component.scss'
})
export class PenaltiesModalConsultComplaintComponent implements OnInit {
  //Variables
  @Input() denunciaId!: number;
  files: File[] = [];
  complaint: any;
  loggedUserId: number = 1;
  private readonly userService = inject(UserService);

  //Constructor
  constructor(
    public activeModal: NgbActiveModal,
    public complaintService: ComplaintService,
  ) { }


  //Init
  ngOnInit(): void {
    this.getComplaint();
    this.loadComplaintFiles();
  }


  //Button to close the modal
  close() {
    this.activeModal.close()
  }


  // This method fetches the complaint 
  // details using the provided ID
  // and loads it in its variable.
  
  
  getComplaint() {
    this.complaintService.getById(this.denunciaId).subscribe(
      (response) => {
        this.complaint = response
        if (this.complaint.complaintState == "Nueva") {
          const updatedComplaint: PutStateComplaintDto = {
            id: this.complaint.id,
            userId: this.loggedUserId,
            complaintState: "PENDING",
            stateReason: "Ya vista"
          }
          this.complaintService.putStateComplaint(this.complaint.id, updatedComplaint).subscribe()
        }
        this.userService.getUserById(this.complaint.userId).subscribe(
          (response) => {
            this.complaint.user = response.name + ' ' + response.lastname
          });
      },
      (error) => {
        console.error('Error:', error);
      });
  }


  // Event to update the file list 
  // to the currently selected ones.
  onFileChange(event: any) {
    this.files = Array.from(FileList = event.target.files); //Convert FileList to Array
  }


  //Deprecated, to comment.
  /*addMockFile() {
    const mockImage = new File(["Contenido de la imagen"], "MockImage.png", {
      type: "image/jpeg",
      lastModified: Date.now()
    });
    this.files.push(mockImage); //Agrega la imagen simulada a la lista
  }*/

  
  // This method calls the service to 
  // get the files of the complaint.
  loadComplaintFiles() {
    this.complaintService.getFilesById(this.denunciaId).subscribe(
      (response: any) => {
        console.log('Respuesta de la API:', response);
        console.log('Tipo de respuesta:', typeof response);
        
        if (response && typeof response === 'object') {
          this.files = this.base64ToFile(response);
        } else {
          console.error('La respuesta está mal:', response);
        }
      },
      (error) => {
        console.error('Error:', error);
      }
    );
}

// This method converts a Record/Map of 
// base64 strings and the filename no File objects.

// Param 'response' The response object 
// containing the base64 strings and filenames.

// Returns an array of File objects.
base64ToFile(response: Record<string, string>): File[] {
  const files: File[] = [];

  for (const base64String in response) {
    if (response.hasOwnProperty(base64String)) {
      const fileName = response[base64String].trim(); 
      const trimmedBase64String = base64String.trim(); 
      console.log(`Base64 Key: ${base64String}, File Name: ${fileName}`);
      
      if (trimmedBase64String.startsWith("data:")) {
        
        const [mimeTypePart, base64Data] = trimmedBase64String.split(',');
        const mimeType = mimeTypePart.split(':')[1].split(';')[0]; 
        
        if (base64Data) {
          try {
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const blob = new Blob([byteNumbers], { type: mimeType });
            const file = new File([blob], fileName, { type: mimeType });
            files.push(file);
          } catch (error) {
            console.error(`Error decoding base64 for ${base64String}:`, error);
          }
        } else {
          console.error(`Base64 data is empty for ${base64String}`);
        }
      } else {
        console.warn(`Base64 string does not start with expected prefix for ${base64String}: ${trimmedBase64String}`);
      }
    }
  }
  return files; 
}



// This method tracks the files by their id.
  trackByFile(index: number, file: any): number {
    return file.id;
  }



// This method creates a URL 
// for the file and downloads it.

// Param 'file' The file to be downloaded.

// Returns a download prompt for the file.
  downloadFile(file: File) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }


}

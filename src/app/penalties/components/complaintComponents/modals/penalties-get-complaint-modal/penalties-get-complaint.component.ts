import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ComplaintService } from '../../../../services/complaints.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PutStateComplaintDto } from '../../../../models/complaint';
import { UserService } from '../../../../../users/users-servicies/user.service';
import { AuthService } from '../../../../../users/users-servicies/auth.service';

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


  //Constructor
  constructor(
    private activeModal: NgbActiveModal,
    private complaintService: ComplaintService,
    private authService: AuthService,
    private userService: UserService
  ) { }


  //Init
  ngOnInit(): void {
    this.getComplaint();
    this.loadComplaintFiles();
  }


  //Cierra el modal
  close() {
    this.activeModal.close()
  }


  //-----------------------------------CARGA DE DATOS--------------------------------------//

  //Busca los datos de la denuncia
  getComplaint() {
    this.complaintService.getById(this.denunciaId).subscribe(
      (response) => {
        this.complaint = response

        //Si la denuncia esta en estado "Nueva" se cambia a "Pendiente"
        if (this.complaint.complaintState == "Nueva") {
          const updatedComplaint: PutStateComplaintDto = {
            id: this.complaint.id,
            userId: this.loggedUserId,
            complaintState: "PENDING",
            stateReason: "Ya vista"
          }
          this.complaintService.putStateComplaint(this.complaint.id, updatedComplaint).subscribe()


        }

        //Se obtiene el nombre del usuario que realizo la denuncia
        this.userService.getUserById(this.complaint.userId).subscribe(
          (response) => {
            this.complaint.user = response.name + ' ' + response.lastname
          });
      },
      (error) => {
        console.error('Error al obtener la denuncia: ', error);
      });
  }


  //Busca los archivos adjuntados de la denuncia
  loadComplaintFiles() {
    this.complaintService.getFilesById(this.denunciaId).subscribe(
      (response: any) => {
        this.files = this.base64ToFile(response);
      },
      (error) => {
        console.error('Error al obtener las imagenes: ', error);
      }
    );
  }


  //-----------------------------------MANEJO DE FILES--------------------------------------//

  // Returns an array of File objects.
  base64ToFile(response: Record<string, string>): File[] {
    const files: File[] = [];

    for (const base64String in response) {
      if (response.hasOwnProperty(base64String)) {
        const fileName = response[base64String].trim();
        const trimmedBase64String = base64String.trim();
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


  //Retorna el id del archivo para identificarlo
  trackByFile(index: number, file: any): number {
    return file.id;
  }


  //Descarga la imagen
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

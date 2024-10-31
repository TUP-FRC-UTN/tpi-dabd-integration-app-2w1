import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../../users-servicies/user.service';
import { LoginService } from '../../../users-servicies/login.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalInfoUserComponent } from '../users-modal-info-user/modal-info-user.component';
import { UserGet } from '../../../users-models/users/UserGet';
import { GetPlotDto } from '../../../users-models/plot/GetPlotDto';
import { PlotService } from '../../../users-servicies/plot.service';
import { AuthService } from '../../../users-servicies/auth.service';

@Component({
  selector: 'app-users-familiar-group',
  standalone: true,
  imports: [],
  templateUrl: './users-familiar-group.component.html',
  styleUrl: './users-familiar-group.component.css'
})
export class UsersFamiliarGroupComponent implements OnInit {

  constructor(private router: Router,private modal: NgbModal) { }

  private readonly apiService = inject(UserService);
  private readonly plotService = inject(PlotService);
  private readonly authService = inject(AuthService);

  familyGroup: UserGet[] = [];
  plot : GetPlotDto = new GetPlotDto();
  userModal: UserGet = new UserGet();

  ngOnInit() {
    this.apiService.getUsersByPlotID(1).subscribe({
      next: users => {
        // traer a todos menos al que tenga un rol owner
        console.log(users);
        
        this.familyGroup = users.filter(user => !user.roles.includes('Propietario'));        
        
      },
      error: error => {
        console.error(error);
      }
    })

    this.plotService.getPlotById(this.authService.getUser().plotId).subscribe({
      next: plot => {
        // traer a todos menos al que tenga un rol owner
        this.plot = plot;    
      },
      error: error => {
        console.error(error);
      }
    })


  }
  
  //Acorta el nombre completo
  showName(name: String){
    return name.substring(0, 17) + "...";
  }

  //Mostrar solo un rol
  showRoles(name: String[]){
    if(name.length == 1){
      return name[0];
    }
    return name[0] + "...." ;
  }

  //Mostrar el email
  showEmail(name: String){
    return name.substring(0, 15) + "...";
  }
  
  //Redirecciona a editar un usuario
  redirectEdit(id: number) {
    this.router.navigate(['/home/users/edit', id]); 
  }

  //Redirecciona  a agregar usuario
  redirectAdd() {
    this.router.navigate(['/home/users/add']); 
  }

  //Abre el modal con la información del usuario
  async abrirModal(type: string, userId: number) {
    console.log("Esperando a que userModal se cargue...");
  
    //Espera a que se cargue el usuario seleccionado
    try {
      await this.selectUser(userId);
      console.log("userModal cargado:", this.userModal);
  
      // Una vez cargado, abre el modal
      const modalRef = this.modal.open(ModalInfoUserComponent, { size: 'lg', keyboard: false });
      modalRef.componentInstance.typeModal = type; //Pasar el tipo de modal al componente hijo
      modalRef.componentInstance.userModal = this.userModal;
      modalRef.componentInstance.plotModal = this.plot;

      modalRef.result.then((result) => {        
        this.ngOnInit();
      });

    } catch (error) {
      console.error('Error al abrir el modal:', error);
    }
  }

  //Selecciona un usuario por su id
  selectUser(id: number): Promise<UserGet> {
      return new Promise((resolve, reject) => {
          this.apiService.getUserById(id).subscribe({
              next: (data: UserGet) => {
                  this.userModal = data;
                  Swal.close(); 
                  resolve(data); 
              },
              error: (error) => {
                  console.error('Error al cargar el usuario:', error);
                  reject(error); 
                  Swal.close();
                  Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'Hubo un problema al cargar el usuario. Por favor, inténtalo de nuevo.'
                  });
              }
          });
      });
  }
}

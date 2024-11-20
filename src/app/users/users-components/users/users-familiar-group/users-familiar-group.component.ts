import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../../users-servicies/user.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalInfoUserComponent } from '../users-modal-info-user/modal-info-user.component';
import { UserGet } from '../../../users-models/users/UserGet';
import { GetPlotDto } from '../../../users-models/plot/GetPlotDto';
import { PlotService } from '../../../users-servicies/plot.service';
import { AuthService } from '../../../users-servicies/auth.service';
import { OwnerService } from '../../../users-servicies/owner.service';
import { ModalEliminarUserComponent } from '../users-modal-eliminar-user/modal-eliminar-user/modal-eliminar-user.component';
import { RoutingService } from '../../../../common/services/routing.service';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';

@Component({
  selector: 'app-users-familiar-group',
  standalone: true,
  imports: [],
  templateUrl: './users-familiar-group.component.html',
  styleUrl: './users-familiar-group.component.css'
})
export class UsersFamiliarGroupComponent implements OnInit, OnDestroy {

  constructor(private modal: NgbModal) { }

  private readonly apiService = inject(UserService);
  private readonly plotService = inject(PlotService);
  private readonly authService = inject(AuthService);
  private readonly routingService = inject(RoutingService);
  private readonly suscriptionService = inject(SuscriptionManagerService);

  icons = [
    { name: 'Icono 1', url: 'https://i.ibb.co/DpxXd6C/icono1.png' },
    { name: 'Icono 2', url: 'https://i.ibb.co/Vp515Fc/icono2.png' },
    { name: 'Icono 3', url: 'https://i.ibb.co/rvWz6Sh/icono3.png' },
    { name: 'Icono 4', url: 'https://i.ibb.co/1snjZn2/icono4.png' },
    { name: 'Icono 5', url: 'https://i.ibb.co/HNRqv7m/icono5.png' },
    { name: 'Icono 6', url: 'https://i.ibb.co/23B7tMh/icono6.png' },
    { name: 'Icono 7', url: 'https://i.ibb.co/FHR80gq/icono7.png' },
    { name: 'Icono 8', url: 'https://i.ibb.co/fMcysX4/icono8.png' },
    { name: 'Icono 9', url: 'https://i.ibb.co/k23ngcS/icono9.png' },
    { name: 'Icono 10', url: 'https://i.ibb.co/2gJgvFt/icono10.png' },
  ]

  familyGroup: UserGet[] = [];
  plots: GetPlotDto[] = [];
  userModal: UserGet = new UserGet();

  ngOnInit() {
    //Limpia la lista de grupo familiar
    this.familyGroup = [];

    this.loadFamilyMembers();
  }

  //Desuscribirse de los observables
  ngOnDestroy(): void {
    this.suscriptionService.unsubscribeAll();
  }

  //---------------------------------------------------Carga de datos---------------------------------------------------

  //Carga los miembros de la familia
  loadFamilyMembers() {
    for (let plot of this.authService.getUser().plotId) {
      let sus = this.apiService.getUsersByPlotID(plot).subscribe({
        next: users => {

          var users: UserGet[] = users.filter(user => !user.roles.includes('Propietario'));

          this.familyGroup = this.familyGroup.concat(users);

          //Ordena alfabéticamente
          this.familyGroup.sort((a, b) => a.name.localeCompare(b.name));

        },
        error: error => {
          console.error(error);
        }
      })

      //Agregar suscripción
      this.suscriptionService.addSuscription(sus);
    }
  }

  //---------------------------------------------------Estilos---------------------------------------------------

  //Mostrar solo un rol
  showRoles(name: String[]) {
    if (name.length == 1) {
      return name[0];
    }
    return name[0] + "...";
  }

  //Mostrar el email
  showEmail(name: String) {
    return name.substring(0, 15) + "...";
  }

  //Acorta el nombre completo
  showName(name: String) {
    return name.substring(0, 17) + "...";
  }

  //Setear el icono
  haveIcon(url: string): boolean {
    for (const icon of this.icons) {
      if (icon.url === url) {
        return true;
      }
    }
    return false;
  }

  //---------------------------------------------------Redirecciones---------------------------------------------------

  //Redirecciona a editar un usuario
  redirectEdit(id: number) {
    this.routingService.redirect(`/main/users/edit/${id}`, 'Modificar usuario');
  }

  //Redirecciona a agregar usuario
  redirectAdd() {
    this.routingService.redirect('/main/users/add', 'Agregar usuario');
  }

  //------------------------------------------------------Modales--------------------------------------------------------

  async openModalEliminar(userId: number) {
    const modalRef = this.modal.open(ModalEliminarUserComponent, { size: 'md', keyboard: false });
    modalRef.componentInstance.userModal = { id: userId };

    // Escuchar el evento de eliminación para recargar
    modalRef.componentInstance.userDeleted.subscribe(() => {
      this.ngOnInit()
    });
  }


  //Abre el modal con la información del usuario
  async abrirModal(type: string, userId: number) {

    //Espera a que se cargue el usuario seleccionado
    try {
      await this.selectUser(userId);
      this.plots = [];

      const sus = this.plotService.getPlotById(this.userModal.plot_id).subscribe({
        next: plot => {
          // traer a todos menos al que tenga un rol owner
          this.plots.push(plot);
        },
        error: error => {
          console.error(error);
        }
      })

      //Agregar suscripción
      this.suscriptionService.addSuscription(sus);

      // Una vez cargado, abre el modal
      const modalRef = this.modal.open(ModalInfoUserComponent, { size: 'lg', keyboard: false });
      modalRef.componentInstance.typeModal = type; //Pasar el tipo de modal al componente hijo
      modalRef.componentInstance.userModal = this.userModal;
      modalRef.componentInstance.plotModal = this.plots;

      modalRef.result.then((result) => {
        this.ngOnInit();
      });

    } catch (error) {
      console.error('Error al abrir el modal:', error);
    }
  }

  //------------------------------------------------------Funciones--------------------------------------------------------

  //Selecciona un usuario por su id
  selectUser(id: number): Promise<UserGet> {
    return new Promise((resolve, reject) => {
      const sus = this.apiService.getUserById(id).subscribe({
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

      //Agregar suscripción
      this.suscriptionService.addSuscription(sus);
    });
  }
}

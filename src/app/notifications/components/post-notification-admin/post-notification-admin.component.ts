import { AfterViewInit, Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { NotificationService } from '../../service/notification.service';
import { NotificationGeneral } from '../../notificationGeneral';
import { UserApiDTO } from '../../models/DTOs/UserApiDTO';
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import { style } from '@angular/animations';
import "datatables.net-select"
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { General } from '../../models/general';
import { NotificationGeneralDTO } from '../../models/DTOs/NotificationGeneralDTO';
import { UserDTO } from '../../models/DTOs/UserDTO';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-post-notification-admin',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './post-notification-admin.component.html',
  styleUrl: './post-notification-admin.component.css'
})
export class PostNotificationAdminComponent implements AfterViewInit, OnInit{

 //Botones
 @Input() info: string = "";

 //Rol del usuario logeado
 @Input() userRole: string = "";

 //Titulo de la pagina
 @Output() sendTitle = new EventEmitter<string>();


  httpClient : HttpClient = inject(HttpClient);
  constructor(private notificationService: NotificationService) {}
  selectValue : string = "1";
  users : UserApiDTO[] = []

  ngOnInit(): void {
    
      const users = this.httpClient.get<UserApiDTO[]>
      ("https://my-json-server.typicode.com/405786MoroBenjamin/users-responses/users")
      .subscribe(response =>
        {this.users = response;
          this.fillTable();
      })
  }

  fillTable() {
    //TODO: JQUERY?????????
    let table = $("#myTable").DataTable();
    for (let user of this.users) {
      
      table.row.add([user.name,user.lastname,user.dni,user.email]).draw(false);
    }
  }
  radioButtonValue : string = "allUsers";
  

  ngAfterViewInit(): void {
      this.setTable();
      this.selectValue = "1"
  }

  setTable(): void {
    $('#myTable').DataTable({
      paging: true,
      searching: true,
      order: [[1,"asc"]],
      lengthChange: true,
      pageLength: 10,
      
      language: {
        emptyTable: "No hay datos para mostrar",
        search: "Buscar",
        loadingRecords: "Cargando...",
        infoEmpty: "No hay usuarios disponibles",
        lengthMenu: "_MENU_ usuarios por pagina",
        info:"Mostrando de _START_ a _END_ total de _TOTAL_ usuarios",
      }
    });
  }

  newNotification : NotificationGeneralDTO = {
    users : [],
    senderId: 0,
    subject: "",
    description : "",
    channel: "EMAIL"
  }

  selectedUser: string = ''; 

  onSubmit(form: NgForm) {
    console.log('click: ', form.value);
    

    if (form.valid && this.selectValue != "1") {

      if (this.radioButtonValue == "allUsers") {
        this.newNotification.users = this.mapUserApiDTOToUserDTO(this.users);
        
      }
      else if (this.radioButtonValue == "onlyTo"){
        this.newNotification.users = this.getSelectedUsers()
      }
      else if (this.radioButtonValue == "exclude") {
        this.newNotification.users = this.getFilteredUsers();
      }

      this.newNotification.channel = this.selectValue;
      
      this.notificationService.postNotification(this.newNotification).subscribe({
        next: (response: any) => {
          console.log('Notificacion enviada: ', response);
          Swal.fire({
            title: '¡Notificación enviada!',
            text: 'La notificacion ha sido enviada correctamente.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false});
        },
        error: (error) => {
          console.error('Error al enviar la notificacion: ', error);
        }
      });
    }
    else {
      console.log("form invalid");
    }
  }



  clearForm(form : NgForm) {
    // form.reset();
    // this.radioButtonValue = "allUsers";
    let table = $("#myTable").DataTable()
    //TODO: REVISAR ESTO
   // table.search((d:any) => d.includes('Alice')).draw();
  }
  getSelectedUsers() : UserDTO[]{
    let table = $("#myTable").DataTable();
    
    let users : UserDTO[] = []
    const amountOfUsers = table.rows({selected:true}).count();
    let rowData = table.rows({ selected: true }).data() as { [key: string]: any };
    for (let i = 0; i < amountOfUsers; i++) {
      //hardcoded telegram chatId and email for demo
      if (i == 0 ) {
        let user : UserDTO = {
          //HARDCODED ID
          id : i,
          email: "solis.luna.ignacio@gmail.com",
          chatId : 5869258860
        }
        users.push(user)
      }
      else if (i == 1 ) {
        let user : UserDTO = {
          id : i,
          email: "facuu.arguellog@gmail.com",
          chatId : 1129773792
        }
        users.push(user)
      }
      else {
        let user : UserDTO = {
          id : i,
          email: rowData[i][3],
          //Cambiar a chatId cuando api users tenga ese campo
          chatId: 0
          
        }
        users.push(user)
      }
      
    }
    return users;
  }

  mapUserApiDTOToUserDTO(userApiArr : UserApiDTO[]) : UserDTO[]{

    let userDTOArray : UserDTO[] = []
    for (let user of userApiArr) {
      let userDTO : UserDTO = {
        id: user.id,
        email: user.email,
        chatId : 0
      }
      userDTOArray.push(userDTO);
    }
    return userDTOArray
  }

  getFilteredUsers() : UserDTO[] {
    let selectedUsers = this.getSelectedUsers();

    const filteredUsers = this.users.filter(
      user => !selectedUsers.some(selectedUser => selectedUser.id === user.id)
    );
    
    let filteredUserDTOArray = this.mapUserApiDTOToUserDTO(filteredUsers);
    
    filteredUserDTOArray[0].chatId = 5869258860;
    filteredUserDTOArray[0].email = "solis.luna.ignacio@gmail.com"
    return filteredUserDTOArray;
    
  }
  
}
import { Component, OnInit } from '@angular/core';
import { NotificationRegisterService } from '../../service/notification-register.service';
import { Notifications } from '../../models/notifications';
import { Access } from '../../models/access';
import { Fine } from '../../models/fine';
import { Payments } from '../../models/payments';
import { General } from '../../models/general';
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import { style } from '@angular/animations';
import "datatables.net-select"
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateValidator } from '../../validators/date.validators';
import { MockUserService } from '../../service/mockUser.service';

@Component({
  selector: 'app-all-notification',
  standalone: true,
  imports: [DatePipe,RouterModule,ReactiveFormsModule],
  templateUrl: './all-notification.component.html',
  styleUrl: './all-notification.component.css'
})
export class AllNotificationComponent implements OnInit{
  
  form = new FormGroup({
    startDate : new FormControl(new Date(),[Validators.required,DateValidator.greatherThanToday]),
    endDate :new FormControl(new Date(),[Validators.required,DateValidator.greatherThanToday])
  });
  


  //propiedades
  selected:string="Todas"
  originalAccessList: Access[] = []; 
  originalFinesList:Fine[] = []
  originalPaymentsList:Payments[] = []
  originalGeneralsList:General[]= []
  data: Notifications = {
    fines: [],
    access: [],
    payments: [],
    generals: []
  };
  //onInit y onDestroy
  ngOnInit(): void {
    this.form.get('startDate')?.valueChanges.subscribe(value=>{
      this.updatedList();

    })

    this.form.get('endDate')?.valueChanges.subscribe(value=>{
      this.updatedList();
      
    })
    this.llenarData();
    ($('#myTable') as any).DataTable({
      select: {
        style: 'multi'
    },
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      pageLength: 10,
      
      language: {
        emptyTable: "Cargando...",
        search: "Buscar",
        loadingRecords: "Cargando...",
        zeroRecords:"No se han encontrado registros" ,
        infoEmpty:"Mostrando 0 de 0 registros.",
        lengthMenu:"Mostrando _MENU_ entradas.",
        paginate: {
        first: "<<",
        last: ">>",
        next: ">",
        previous: "<",
      },
      info:"Mostrando de _START_ a _END_ total de _TOTAL_ notificaciones",
    }

    });
  }
  //injecciones

  constructor(private service: NotificationRegisterService,private serviceUser:MockUserService) {}


  //metodos


  llenarData() {
    const getSubscription = this.service.getData().subscribe({
      next: (value:Notifications) =>{
        this.data = value
        this.originalAccessList = [...value.access]
        this.originalFinesList = [...value.fines]
        this.originalPaymentsList = [...value.payments]
        this.originalGeneralsList = [...value.generals]
        console.log(this.data)
        this.fillTable(); 
      },
      error: ()=> {
        alert('error al cargar las notifications')
      }
     })
  }

  fillTable() {
    let table = $("#myTable").DataTable();
    table.clear().draw()
    if(this.data.access.length>0){
      if(this.selected=="Accesos" || this.selected=="Todas" ){
        for (let notification of this.data.access) {
          const date = notification.date as { [key: string]: any }
          let dateString = date
            table.row.add([notification.subject, notification.description, dateString, notification.nombre + " " + notification.apellido, notification.dni]).draw(false);
          }
      }
    }
    if(this.data.fines.length>0){
      if(this.selected=="Multas" || this.selected=="Todas" ){
        for (let notification of this.data.fines) {
          const date = notification.date as { [key: string]: any }
          let dateString =date
          table.row.add([notification.subject, notification.description, dateString, notification.nombre + " " + notification.apellido, notification.dni]).draw(false);
        }
      }
    }

    if(this.data.payments.length>0){
      if(this.selected=="Pagos" || this.selected=="Todas" ){
        for (let notification of this.data.payments) {
          const date = notification.date as { [key: string]: any }
          let dateString = date
          table.row.add([notification.subject, notification.description, dateString, notification.nombre + " " + notification.apellido, notification.dni]).draw(false);
        }
      }
    }
    if(this.data.generals.length>0){
      if(this.selected=="Generales" || this.selected=="Todas" ){
        for (let notification of this.data.generals) {
          const date = notification.date as { [key: string]: any }
          let dateString = date
          table.row.add([notification.subject, notification.description, dateString, notification.nombre + " " + notification.apellido, notification.dni]).draw(false);
        }
      }
    }
    
    

  }
  
  exportarAExcel() {
        const tabla = $('#myTable').DataTable();
        const filteredData = tabla.rows({ search: 'applied' }).data().toArray();
        
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workBook = XLSX.utils.book_new();
        
        XLSX.utils.book_append_sheet(workBook, worksheet, 'Notificaciones');
        XLSX.writeFile(workBook, 'notificaciones.xlsx');
  }

  exportarAPDF() {
    const tabla = $('#myTable').DataTable();
    const filteredData = tabla.rows({ search: 'applied' }).data().toArray();
  
    const doc = new jsPDF();
  
    doc.setFontSize(18);
    doc.text('Reporte de Notificaciones', 14, 22);
  
    autoTable(doc, {
      head: [['Asunto', 'Descripción', 'Fecha', 'Nombre Destinatario', 'DNI']],
      body: filteredData.map((item: any) => [
        item[0] || 'N/A',
        item[1] || 'N/A',
        item[2] || 'N/A',
        item[3] || 'N/A',
        item[4] || 'N/A' 
      ]),
      startY: 30,
    });
  
    doc.save('notificaciones.pdf');
  }

  //filtro de tipo de notificacion
  cambiar(value:string){
    switch (value){
      case 'Todas':
        this.selected = 'Todas'
        this.fillTable(); 
        break;

      case 'Multas':
        this.selected = 'Multas'
        this.fillTable(); 
        break;

      case 'Accesos':
        this.selected = 'Accesos'
        this.fillTable(); 
        break;

      case 'Pagos':
        this.selected = 'Pagos'
        this.fillTable(); 
        break;

      case 'Generales':
        this.selected = 'Generales'
        this.fillTable(); 
        break;
    }
  }
  //filtro por fechas
  updatedList(){

    let accessList:Access[] = []
    this.data.access = this.originalAccessList
    this.data.access.forEach(e => {
      console.log(e.date)
      const apiDate = new Date(e.date)
      console.log(apiDate)  
      const createdDate = new Date(
        apiDate.getFullYear(),
        apiDate.getMonth(),
        apiDate.getDate(),
        apiDate.getHours(),
        apiDate.getMinutes(),
        apiDate.getSeconds()
      )
      const startDate2 = new Date(this.form.get('startDate')?.value ?? new Date() )
      const endDate2 = new Date(this.form.get('endDate')?.value ?? new Date())
      console.log(createdDate)
      console.log(startDate2)
      console.log(endDate2)
      

      if(createdDate.toISOString().split('T')[0] >= startDate2.toISOString().split('T')[0] && createdDate.toISOString().split('T')[0] <= endDate2.toISOString().split('T')[0] ){
        accessList.push(e)
      }
    
    });
    this.data.access=accessList

    let finesList:Fine[] = []
    this.data.fines = this.originalFinesList
    this.data.fines.forEach(e => {
      const createdDate = new Date(e.date)
      const startDate2 = new Date(this.form.get('startDate')?.value ?? new Date() )
      const endDate2 = new Date(this.form.get('endDate')?.value ?? new Date())
      

      if(createdDate.toISOString().split('T')[0] >= startDate2.toISOString().split('T')[0] && createdDate.toISOString().split('T')[0] <= endDate2.toISOString().split('T')[0] ){
        finesList.push(e)
      }
    
    });
    this.data.fines=finesList


    let paymentsList:Payments[] = []
    this.data.payments = this.originalPaymentsList
    this.data.payments.forEach(e => {
      const createdDate = new Date(e.date)
      const startDate2 = new Date(this.form.get('startDate')?.value ?? new Date() )
      const endDate2 = new Date(this.form.get('endDate')?.value ?? new Date())
      

      if(createdDate.toISOString().split('T')[0] >= startDate2.toISOString().split('T')[0] && createdDate.toISOString().split('T')[0] <= endDate2.toISOString().split('T')[0] ){
        paymentsList.push(e)
      }
    
    });
    this.data.payments=paymentsList
    





    let generalsList:General[] = []
    this.data.generals = this.originalGeneralsList
    this.data.generals.forEach(e => {
      const createdDate = new Date(e.date)
      const startDate2 = new Date(this.form.get('startDate')?.value ?? new Date() )
      const endDate2 = new Date(this.form.get('endDate')?.value ?? new Date())
      if(createdDate.toISOString().split('T')[0] >= startDate2.toISOString().split('T')[0] && createdDate.toISOString().split('T')[0] <= endDate2.toISOString().split('T')[0] ){
        generalsList.push(e)
      }
    
    });
    this.data.generals=generalsList

    this.fillTable();
    console.log(this.data)
  }
  borrar(){
    this.selected="Todas";
    this.form.get('startDate')?.reset()
    this.form.get('endDate')?.reset()
    this.fillTable()
  }


  
}
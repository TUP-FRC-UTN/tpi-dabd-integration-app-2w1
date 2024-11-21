// access-visitors-eventual.component.ts 
import { Component, OnInit } from '@angular/core';
import { AccessVisitorFormComponent } from '../../access_visitors_register/access-visitor-form/access-visitor-form.component';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../../users/users-servicies/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccessUserAllowedInfoDto } from '../../../../models/access-visitors/access-VisitorsModels';
import { AccessUserServiceService } from '../../../../services/access-user/access-user-service.service';
import { CommonModule } from '@angular/common';
import {userTypeMap ,documentTypeMap } from '../../../../models/access-report/constants';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';
import { accessTempRegist, AccessVisitor3, AccessVisitorRecord } from '../../../../models/access-visitors/access-visitors-models';
import Swal from 'sweetalert2';


@Component({
 selector: 'app-access-visitors-eventual',
 standalone: true,
 imports: [AccessVisitorFormComponent, NgSelectModule, FormsModule,CommonModule,ReactiveFormsModule], 
 templateUrl: './access-visitors-eventual.component.html',
 styleUrls: ['./access-visitors-eventual.component.scss']
})
export class AccessVisitorsEventualComponent implements OnInit {
 visitorForm!: FormGroup;
 visitors: AccessUserAllowedInfoDto[] = [];
 selectedVisitorId: AccessUserAllowedInfoDto | null = null;
 selectedVisitor?: AccessUserAllowedInfoDto;
 


 constructor(
   private authService: AuthService,
   private accessUserService: AccessUserServiceService,
   private fb: FormBuilder,
   private giveTempAccess: AccessVisitorsRegisterServiceHttpClientService
 ) {
  this.visitorForm = this.fb.group({
    authorizedType: [''],
    documentType: [''],
    document: [''],
    firstName: [''],
    lastName: [''],
    email: ['',[Validators.email]]
  });
 }

 ngOnInit() {
   const userId = this.authService.getUser().id;  
   this.loadVisitors(userId);
  
 }

 loadVisitors(neighborId: number) {
   this.accessUserService.fetchVisitorsByNeighbor(neighborId)
   .subscribe(visitors => {
    this.visitors = visitors;
   
    console.log('Visitors loaded:', this.visitors);
  });
 }
 

 onVisitorSelect(visitor: AccessUserAllowedInfoDto) {
  if (!visitor) {
    this.visitorForm = this.fb.group({
      authorizedType: [''],
      documentType: [''],
      document: [''],
      firstName: [''],
      lastName: [''],
      email: ['']
    });
    console.log("pasa");
    this.selectedVisitor = undefined;
    return;
  } 

  if (visitor) {
    console.log('Email del visitante:', visitor.email);
    this.visitorForm.get('firstName')?.disable();
    this.visitorForm.get('lastName')?.disable();
    this.visitorForm.get('document')?.disable();
    this.visitorForm.get('authorizedType')?.disable();   
    this.visitorForm.get('documentType')?.disable();
    this.visitorForm.get('email')?.disable();

    this.visitorForm.patchValue({
      authorizedType: userTypeMap[visitor.userType.description],
      documentType: documentTypeMap[visitor.documentTypeDto.description],
      document: visitor.document,
      firstName: visitor.name,
      lastName: visitor.last_name,
      email: visitor.email 
      
    });
    
    this.selectedVisitor = visitor;   
  }
 }
 onGiveTempAccess() {
  if (this.visitorForm.valid || this.selectedVisitor) {
    const formData = this.selectedVisitor ?? this.visitorForm.value;
    if (!formData.authorizedType)
      formData.authorizedType = userTypeMap[formData.userType.description];
    if (!formData.documentType)
      formData.documentType = documentTypeMap[formData.documentTypeDto.description];
    console.log(formData);
    const userId = this.authService.getUser().id;
    console.log('Type:', formData.authorizedType);
   
    if (!formData.email) {
      const visitorData: AccessVisitor3 = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        document: formData.document,
        documentType: parseInt(formData.documentType),
        userType: parseInt(formData.authorizedType)
      };
 
      const accessTempRegistData: accessTempRegist = {
        visitor: visitorData,
        guard_Id: 0,
        neighbor_Id: userId
      };
 
      this.giveTempAccess.giveTempRange(accessTempRegistData)
        .subscribe({
          next: (response) => {
            this.visitorForm.reset();
            this.selectedVisitor = undefined;
            Swal.fire('Acceso temporal otorgado', 'El acceso temporal ha sido otorgado correctamente', 'success');
          },
          error: (error) => {
           Swal.fire('Error', 'Ha ocurrido un error al otorgar el acceso temporal', 'error');
          }
        });
    } 
   
    else {
      const currentDate = new Date();
      const endTimeToday = new Date();
      endTimeToday.setHours(23, 59, 59);
      const dayToday = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
 
      const visitorRecord: AccessVisitorRecord = {
        visitors: [{
          firstName: formData.firstName,
          lastName: formData.lastName,
          document: formData.document,
          documentType: parseInt(formData.documentType),
          email: formData.email,
          hasVehicle: false,
          userType: parseInt(formData.authorizedType),
          visitDate: currentDate
        }],
        authRange: {
          initDate: currentDate,
          endDate: currentDate,
          neighbourId: userId,
          allowedDays: [{
            day: {
              name: dayToday,
              value: true
            } , 
            startTime: currentDate,
            endTime: endTimeToday,
            crossesMidnight: false
          }]
        }
      };
 
      this.giveTempAccess.postVisitorRecord(visitorRecord)
        .subscribe({
          next: (response) => {
            this.visitorForm.reset();
            Swal.fire('Acceso temporal otorgado', 'El acceso temporal ha sido otorgado correctamente', 'success');
          },
          error: (error) => {
            Swal.fire('Error', 'Ha ocurrido un error al otorgar el acceso temporal', 'error');
          }
        });
    }
  }
}
}

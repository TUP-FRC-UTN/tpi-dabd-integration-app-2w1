import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccessOwnerRenterserviceService } from '../../../../services/access-owner/access-owner-renterservice.service';
import { Subscription, takeUntil } from 'rxjs';
import { AuthService } from '../../../../../users/users-servicies/auth.service';
import { userTypeMap, documentTypeMap } from '../../../../models/access-report/constants';
import { AccessUserAllowedInfoDto, AccessDay, AccessNewAuthRangeDto, AccessAllowedDaysDto } from '../../../../models/access-visitors/access-VisitorsModels';
import { AccessUserServiceService } from '../../../../services/access-user/access-user-service.service';
import { AccessAuthRange, UserType } from '../../../../models/access-visitors/access-visitors-models';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';
import { AccessTimeRangeVisitorsRegistrationComponent } from "../../access_visitors_register/access-time-range-visitors-registration/access-time-range-visitors-registration.component";
import { AccessVisitorsRegisterServiceService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service/access-visitors-register-service.service';

@Component({
  selector: 'app-acceses-update-acceses',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule, FormsModule, AccessTimeRangeVisitorsRegistrationComponent],
  templateUrl: './acceses-update-acceses.component.html',
  styleUrl: './acceses-update-acceses.component.scss'
})
export class AccesesUpdateAccesesComponent implements OnInit,OnDestroy {
  ngOnDestroy(): void {
    this.suscription.unsubscribe()
  }
  private userId:number=0;
  ngOnInit(): void {
   this.userId  = this.authService.getUser().id;  
    this.loadVisitors(this.userId);
    this.loadUsersType();
  }
  private readonly updateService=inject(AccessOwnerRenterserviceService);
  private readonly visitorService=inject(AccessUserServiceService)
  private readonly authService=inject(AuthService)
  private readonly visitorHttpService=inject(AccessVisitorsRegisterServiceHttpClientService)
  private readonly authRService=inject(AccessVisitorsRegisterServiceService)
  private readonly suscription=new Subscription();
  private authRange: AccessAuthRange | null = null;
  private day:AccessAllowedDaysDto[]=[]
  allowedDays: any[] = [];
   selectedVisitor?: AccessUserAllowedInfoDto;
  visitors: AccessUserAllowedInfoDto[] = [];
  selectedVisitorId: AccessUserAllowedInfoDto | null = null;
  document:string='';
  documentType:string='';
  usersType: UserType[] = [];
 

  visitorForm:FormGroup=new FormGroup({
    authorizedType:new FormControl({ value: '', disabled: false },[Validators.required]),
    documentType:new FormControl({ value: '', disabled: false },[Validators.required]),
    document:new FormControl({ value: '', disabled: false },[Validators.required]),
    firstName:new FormControl({ value: '', disabled: false },[Validators.required]),
    lastName:new FormControl({ value: '', disabled: false }),
    email:new FormControl({ value: '', disabled: false },[Validators.email]), 
  })
  setDocument(document:string,documentType:string):void{
    this.document=document;
    this.documentType=documentType;
  }
 


  loadVisitors(neighborId: number) {
  const sub=  this.visitorService.fetchVisitorsByNeighbor(neighborId)
    .subscribe(visitors => {
     this.visitors = visitors;
    
     console.log('Visitors loaded:', this.visitors);
   });
   this.suscription.add(sub);
  }
  resetForm() {
    this.visitorForm.reset();
    this.selectedVisitor = undefined;

 }

  onVisitorSelect(visitor: AccessUserAllowedInfoDto) {
    if (!visitor) {
      this.resetForm();
    }
    else  {
      
      console.log('Email del visitante:', visitor.email);

      this.visitorForm.patchValue({
        authorizedType:visitor.userType.description,
        documentType:visitor.documentTypeDto.description,
        document: visitor.document,
        firstName: visitor.name,
        lastName: visitor.last_name,
        email: visitor.email 
        
      });
      this.selectedVisitor = visitor;
      this.setDocument(this.selectedVisitor.document,this.selectedVisitor.documentTypeDto.description);
      
    }
   }
 
  loadUsersType(): void {
    const insuranceSubscription = this.visitorHttpService.getUsersType().subscribe({
      next: (types: UserType[]) => {
        this.usersType = types;
        console.log('Tipos de usuario cargados:', this.usersType);
      },
      error: (error) => {
        console.error('Error al cargar tipos de usuarios:', error);
      }
    });
    this.suscription.add(insuranceSubscription);
  }
  
  onSubmit():void{
    if(!this.visitorForm.valid){
      const formValue=this.visitorForm.value;
      console.log("TipoDoc")
      console.log("VALOR DEL FORM :"+JSON.stringify(formValue));
      const formData={
        document:formValue.document,
        name:formValue.firstName,
        last_name:formValue.lastName,
        email: formValue.email,
        vehicles: [],
        userType: formValue.authorizedType, 
        authRanges: [],  
        documentTypeDto: formValue.documentType,
        neighbor_id:this.userId
      }
         
     this.authRService.getAuthRange().subscribe({
  next: (data) => {
   this. authRange = data; 
    console.log(this.authRange); 
  },
  error: (err) => {
    console.error('Error obteniendo el authRange:', err);
  }
});

if(this.authRange!==null){
  this.authRange.allowedDays.forEach(dy=>{
    console.log("dia : ",dy)
    if (dy.day.name === 'Lun') {
      dy.day.name = 'MONDAY';
    } else if (dy.day.name === 'Mar') {
      dy.day.name = 'TUESDAY';
    } else if (dy.day.name === 'Mié') {
      dy.day.name = 'WEDNESDAY';
    } else if (dy.day.name === 'Jue') {
      dy.day.name = 'THURSDAY';
    } else if (dy.day.name === 'Vie') {
      dy.day.name = 'FRIDAY';
    } else if (dy.day.name === 'Sáb') {
      dy.day.name = 'SATURDAY';
    } else if (dy.day.name === 'Dom') {
      dy.day.name = 'SUNDAY';
    }
    let d:AccessAllowedDaysDto={

      day:dy.day.name,
      init_hour:dy.startTime.toTimeString().slice(0, 8),
      end_hour:dy.endTime.toTimeString().slice(0, 8)
    }
    this.allowedDays.push(d) 

  })

  const dto:AccessNewAuthRangeDto={
    init_date:this.authRange.initDate.toISOString().split('T')[0],
    end_date:this.authRange.endDate.toISOString().split('T')[0],
    neighbor_id:this.authRange.neighbourId,
    allowedDaysDtos:this.allowedDays
  }
  
  const updateAccess={
    userAllowedInfoDto:formData,
    authRangeDto:dto
  }
  console.log("Dto: ",updateAccess)
  const sub=this.updateService.updateAccess(this.document,this.documentType,updateAccess).subscribe({
    next:(response)=>{
      alert("Se actualizo el auth")
      console.log(response);
      this.resetForm();
    },
    error:(error)=>{
      alert("hubo un error")
      console.log(error);
    }
  })
  }
}
}

}

import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccessOwnerRenterserviceService } from '../../../../services/access-owner/access-owner-renterservice.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../../users/users-servicies/auth.service';
import { AccessUserAllowedInfoDto, AccessDay, AccessNewAuthRangeDto, AccessAllowedDaysDto } from '../../../../models/access-visitors/access-VisitorsModels';
import { AccessUserServiceService } from '../../../../services/access-user/access-user-service.service';
import { AccessAuthRange, UserType } from '../../../../models/access-visitors/access-visitors-models';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';
import { AccessTimeRangeVisitorsRegistrationComponent } from "../../access_visitors_register/access-time-range-visitors-registration/access-time-range-visitors-registration.component";
import { AccessVisitorsRegisterServiceService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service/access-visitors-register-service.service';

@Component({
  selector: 'app-acceses-update-acceses',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    NgSelectModule, 
    FormsModule, 
    AccessTimeRangeVisitorsRegistrationComponent
  ],
  templateUrl: './acceses-update-acceses.component.html',
  styleUrl: './acceses-update-acceses.component.scss'
})
export class AccesesUpdateAccesesComponent implements OnInit, OnDestroy {

  private readonly updateService = inject(AccessOwnerRenterserviceService);
  private readonly visitorService = inject(AccessUserServiceService);
  private readonly authService = inject(AuthService);
  private readonly visitorHttpService = inject(AccessVisitorsRegisterServiceHttpClientService);
  private readonly authRService = inject(AccessVisitorsRegisterServiceService);


  private userId: number = 0;
  private readonly suscription = new Subscription();
  private authRange: AccessAuthRange | null = null;
  

  visitors: AccessUserAllowedInfoDto[] = [];
  selectedVisitor?: AccessUserAllowedInfoDto;
  selectedVisitorId: AccessUserAllowedInfoDto | null = null;
  document: string = '';
  documentType: string = '';
  usersType: UserType[] = [];
  allowedDays: AccessAllowedDaysDto[] = [];

  visitorForm: FormGroup = new FormGroup({
    authorizedType: new FormControl('', [Validators.required]),
    documentType: new FormControl('', [Validators.required]),
    document: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.email])
  });

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.suscription.unsubscribe();
  }

  private initializeComponent(): void {
    this.userId = this.authService.getUser().id;
    this.loadVisitors(this.userId);
    this.loadUsersType();
    this.setupFormValidation();
  }

  private setupFormValidation(): void {
    this.visitorForm.get('document')?.valueChanges.subscribe(value => {
      console.log('Document value changed:', value);
    });
  }

  loadVisitors(neighborId: number): void {
    const sub = this.visitorService.fetchVisitorsByNeighbor(neighborId)
      .subscribe({
        next: (visitors) => {
          this.visitors = visitors;
          console.log('Visitors loaded successfully:', visitors);
        },
        error: (error) => {
          console.error('Error loading visitors:', error);
        }
      });
    this.suscription.add(sub);
  }

  loadUsersType(): void {
    const sub = this.visitorHttpService.getUsersType().subscribe({
      next: (types: UserType[]) => {
        this.usersType = types.map(type => ({
          ...type,
          description: this.tiposUsuarioTraduccion[type.description.toUpperCase()] || type.description
        }));
        console.log('Tipos de usuario cargados:', this.usersType);
      },
      error: (error) => {
        console.error('Error al cargar tipos de usuario:', error);
      }
    });
    this.suscription.add(sub);
  }

  onVisitorSelect(visitor: AccessUserAllowedInfoDto | null): void {
    if (!visitor) {
      this.resetForm();
      return;
    }

    console.log('Visitante seleccionado:', visitor);
    
   
    const tipoUsuarioCoincidente = this.usersType.find(
      tipo => tipo.description.toLowerCase() === 
        (this.tiposUsuarioTraduccion[visitor.userType.description.toUpperCase()] || visitor.userType.description).toLowerCase()
    );

    if (!tipoUsuarioCoincidente) {
      console.warn('No se encontró un tipo de usuario coincidente para:', visitor.userType.description);
    }


    this.visitorForm.patchValue({
      authorizedType: tipoUsuarioCoincidente?.description || 
        (this.tiposUsuarioTraduccion[visitor.userType.description] || visitor.userType.description),
      documentType: visitor.documentTypeDto.description,
      document: visitor.document,
      firstName: visitor.name,
      lastName: visitor.last_name,
      email: visitor.email
    });

    this.selectedVisitor = visitor;
    this.setDocument(visitor.document, visitor.documentTypeDto.description);
  }

  private tiposUsuarioTraduccion: { [key: string]: string } = {
    'Visitor': 'Visitante',
    'Worker': 'Obrero',
    'Delivery': 'Delivery',
    'Taxi': 'Taxi',
    'Cleaning': 'Personal de limpieza',
    'Gardener': 'Jardinero'
  };

  compareUserTypes(type1: any, type2: any): boolean {
    if (!type1 || !type2) return false;
    

    if (type1.description && type2.description) {
      return type1.description.toLowerCase() === type2.description.toLowerCase();
    }

    return type1 === type2;
  }

  setDocument(document: string, documentType: string): void {
    this.document = document;
    this.documentType = documentType;
  }

  resetForm(): void {
    this.visitorForm.reset();
    this.selectedVisitor = undefined;
    this.document = '';
    this.documentType = '';
    this.allowedDays = [];
  }

  onSubmit(): void {
    if (!this.visitorForm.valid) {
      this.showFormErrors();
      return;
    }

    this.getAuthRangeAndUpdate();
  }

  private showFormErrors(): void {
    console.error('Form is invalid');
    Object.keys(this.visitorForm.controls).forEach(key => {
      const control = this.visitorForm.get(key);
      if (control?.errors) {
        console.error(`${key} validation errors:`, control.errors);
      }
    });
  }

  private getAuthRangeAndUpdate(): void {
    const sub = this.authRService.getAuthRange().subscribe({
      next: (authRange) => {
        if (!authRange) {
          console.error('No auth range received');
          return;
        }

        this.authRange = authRange;
        this.processAuthRange(authRange);
      },
      error: (err) => {
        console.error('Error getting auth range:', err);
        alert('Error al obtener el rango de autorización');
      }
    });

    this.suscription.add(sub);
  }

  private processAuthRange(authRange: AccessAuthRange): void {
    this.allowedDays = this.processAllowedDays(authRange);
    const updateAccess = this.createUpdateAccessDto(authRange);
    this.submitUpdate(updateAccess);
  }

  private processAllowedDays(authRange: AccessAuthRange): AccessAllowedDaysDto[] {
    const dayMappings: { [key: string]: string } = {
      'Lun': 'MONDAY',
      'Mar': 'TUESDAY',
      'Mié': 'WEDNESDAY',
      'Jue': 'THURSDAY',
      'Vie': 'FRIDAY',
      'Sáb': 'SATURDAY',
      'Dom': 'SUNDAY'
    };

    return authRange.allowedDays.map(dy => ({
      day: dayMappings[dy.day.name] || dy.day.name,
      init_hour: dy.startTime.toTimeString().slice(0, 8),
      end_hour: dy.endTime.toTimeString().slice(0, 8)
    }));
  }

  private createUpdateAccessDto(authRange: AccessAuthRange) {
    const formValue = this.visitorForm.value;
    
    const formData = {
      document: formValue.document,
      name: formValue.firstName,
      last_name: formValue.lastName,
      email: formValue.email || null, 
      vehicles: [],
      userType: formValue.authorizedType,
      authRanges: [],
      documentTypeDto: formValue.documentType,
      neighbor_id: this.userId
    };

    const dto: AccessNewAuthRangeDto = {
      init_date: authRange.initDate.toISOString().split('T')[0],
      end_date: authRange.endDate.toISOString().split('T')[0],
      neighbor_id: authRange.neighbourId,
      allowedDaysDtos: this.allowedDays
    };

    return {
      userAllowedInfoDto: formData,
      authRangeDto: dto
    };
  }

  private submitUpdate(updateAccess: any): void {
    const sub = this.updateService.updateAccess(
      this.document,
      this.documentType,
      updateAccess
    ).subscribe({
      next: (response) => {
        console.log('Update successful:', response);
        alert('Acceso actualizado exitosamente');
        this.onUpdateSuccess();
      },
      error: (error) => {
        console.error('Update failed:', error);
        alert('Error al actualizar el acceso');
      }
    });

    this.suscription.add(sub);
  }

  private onUpdateSuccess(): void {
    this.resetForm();
    this.loadVisitors(this.userId); 
  }
}
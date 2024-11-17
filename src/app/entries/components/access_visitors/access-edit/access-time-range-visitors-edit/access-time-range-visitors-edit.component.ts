import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AccessAllowedDay, AccessDay, AccessAuthRange,AccessUser } from '../../../../models/access-visitors/access-visitors-models';
import { AccessVisitorsRegisterServiceService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service/access-visitors-register-service.service';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';
import { takeUntil } from 'rxjs';
import { AccessVisitorsEditServiceService } from '../../../../services/access_visitors/access-visitors-edit/access-visitors-edit-service/access-visitors-edit-service.service';
import { AccessVisitorsEditServiceHttpClientService } from '../../../../services/access_visitors/access-visitors-edit/access-visitors-edit-service-http-service/access-visitors-edit-service-http-client.service';
import { AccessApiAllowedDay, AccessAuthRangeInfoDto2 } from '../../../../models/access-visitors/access-VisitorsModels';
import { VisitorsService } from '../../../../services/access_visitors/access-visitors.service';

@Component({
  selector: 'app-access-time-range-visitors-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './access-time-range-visitors-edit.component.html',
  styleUrl: './access-time-range-visitors-edit.component.css'
})
export class AccessTimeRangeVisitorsEditComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();
  
  private _isFromParent: boolean = true;
  neighborid: number = 0;

  days: AccessDay[] = [
    { name: 'Lun', value: false },
    { name: 'Mar', value: false },
    { name: 'Mié', value: false },
    { name: 'Jue', value: false },
    { name: 'Vie', value: false },
    { name: 'Sáb', value: false },
    { name: 'Dom', value: false },
  ];

  form: FormGroup;

  private _allowedDays: AccessApiAllowedDay[] = [];

  orderDays: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  constructor(private cdr: ChangeDetectorRef,    private visitorService: AccessVisitorsEditServiceService, private fb: FormBuilder,private httpService:AccessVisitorsEditServiceHttpClientService) {
      this.form = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      initHour: ['', Validators.required],
      endHour: ['', Validators.required],
      Lun: [{ value: false, disabled: true }],
      Mar: [{ value: false, disabled: true }],
      Mié: [{ value: false, disabled: true }],
      Jue: [{ value: false, disabled: true }],
      Vie: [{ value: false, disabled: true }],
      Sáb: [{ value: false, disabled: true }],
      Dom: [{ value: false, disabled: true }],
    });


    this.form.get('startDate')?.valueChanges.subscribe(() => this.updateAvailableDays());
    this.form.get('endDate')?.valueChanges.subscribe(() => this.updateAvailableDays());
  }
  
  updateAvailableDays(): void {
    const startDate = this.form.get('startDate')?.value;
    const endDate = this.form.get('endDate')?.value;
    
    // Deshabilitar todos los días si no hay fechas seleccionadas
    if (!startDate || !endDate) {
      this.orderDays.forEach(day => {
        this.form.get(day)?.disable();
      });
      return;
    }
    //SOLUCION POSIBLE:
    // Crear fechas con la hora correcta
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    // Obtener los días disponibles
    const availableDays = this.getDaysBetweenDates(start, end);

    // Primero deshabilitar todos los días
    this.orderDays.forEach(day => {
      const control = this.form.get(day);
      control?.disable();
      control?.setValue(false);
    });
    // Luego habilitar solo los días dentro del rango
    availableDays.forEach(day => {
      const control = this.form.get(day);
      if (control) {
        control.enable();
      }
    });
    console.log('Días disponibles:', availableDays);
  }

  
  getDaysBetweenDates(start: Date, end: Date): string[] {

    const spanishDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];    
    const startDate = new Date(start);
    const endDate = new Date(end);
    

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    const days = new Set<string>();
    const currentDate = new Date(startDate);
    

    while (currentDate <= endDate) {
        const dayName = spanishDays[currentDate.getDay()];
        days.add(dayName);
        
        
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 1);
        currentDate.setTime(nextDate.getTime());
    }
    
    return Array.from(days);
}
  


 get areDatesDisabled(): boolean {
  return this._allowedDays.length === 0; 
}

get areDatesReadonly(): boolean {
  const hasValues = this.form.get('startDate')?.value && 
                   this.form.get('endDate')?.value;
  return this._allowedDays.length > 0 && 
         this._isFromParent && 
         hasValues;
}
 
disableDateInputs: boolean = false;


  ngOnInit(): void {
    this.visitorService.getAllowedDays().subscribe(days => {
      this._allowedDays = days;
      this.updateDaysSelected();
    });
    this.updateDateFieldsState();
   
    
  }

  agregarAuthRange(): void {
    console.log('Iniciando agregarAuthRange');
    console.log('Valores del formulario:', this.form.value);
    
    if (!this.validateDates()) {
      return;
    }

    if (this._allowedDays.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Por favor, agregue al menos un día permitido.',
      });
      return;
    }

    const startDate = new Date(this.form.value.startDate);
    const endDate = new Date(this.form.value.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las fechas proporcionadas no son válidas.',
      });
      return;
    }
    this.visitorService.getNeighbors().subscribe(id => {
      this.neighborid = id;
  
    });
    console.log('Valores del vecino:', this.neighborid);
    const authRange: AccessAuthRangeInfoDto2 = {
      
      neighbor_id :this.neighborid,
      init_date: startDate,
      end_date: endDate,
      allowedDays: this._allowedDays,
      
    };

    try {
      this.visitorService.setAuthRange(authRange);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Rango de autorización agregado correctamente.',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al guardar el rango de autorización.',
      });
    }
  }

  updateDaysSelected(): void {
    this.days.forEach(day => {
      const control = this.form.get(day.name);
      if (control) {
        const isAllowed = this.allowedDays.some(dayAllowed => dayAllowed.day === day.name);
        if (isAllowed) {
          control.setValue(true);
          control.disable();
        } else if (!control.disabled) {
          control.setValue(false);
        }
      }
    });
  }

  
  get allowedDays(): AccessApiAllowedDay[] {
    return [...this._allowedDays].sort((a, b) => {
      const indexA = this.orderDays.indexOf(a.day);
      const indexB = this.orderDays.indexOf(b.day);
      return indexA - indexB;
    });
  }

  validateHours(): boolean {
    if (!this.form.value.initHour || !this.form.value.endHour) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingrese tanto la hora de inicio como la hora de fin.',
      });
      return false;
    }
    return true;
  }
  private updateDateFieldsState(): void {
    if (this._allowedDays.length > 0) {
      this.form.controls['startDate'].disable();
      this.form.controls['endDate'].disable();
    } else {
      this.form.controls['startDate'].enable();
      this.form.controls['endDate'].enable();
    }
  }
  agregarDiasPermitidos(): void {
    if (!this.validateHours()) return;
    if (!this.validateDates()) return;
    
    const [initHour, initMinute] = this.form.value.initHour.split(':').map(Number);
    const [endHour, endMinute] = this.form.value.endHour.split(':').map(Number);

    const selectedDays = this.days.filter(day => this.form.controls[day.name].value);
    const newDaysToAdd: AccessApiAllowedDay[] = selectedDays.map(day => ({
      day: this.getDayName(day.name),
      init_hour: [initHour, initMinute],
      end_hour: [endHour, endMinute]
    }));

    // Verificar días duplicados
    const duplicates = newDaysToAdd.filter(newDay => 
      this.allowedDays.some(existingDay => 
        existingDay.day === newDay.day &&
        existingDay.init_hour[0] === newDay.init_hour[0] &&
        existingDay.init_hour[1] === newDay.init_hour[1] &&
        existingDay.end_hour[0] === newDay.end_hour[0] &&
        existingDay.end_hour[1] === newDay.end_hour[1]
      )
    );

  

    // Si no hay duplicados, agregar los días
    this.visitorService.addAllowedDays(newDaysToAdd);
    
    // Limpiar los campos del formulario
    this.form.controls['initHour'].setValue('');
    this.form.controls['endHour'].setValue('');
    this.resetDaySelections();
  }

  private resetDaySelections(): void {
    this.days.forEach(day => {
      const control = this.form.get(day.name);
      if (control && !control.disabled) {
        control.setValue(false);
      }
    });
  }
  isAllowedDay(day: AccessDay): boolean {
    return this._allowedDays.some(allowedDay => allowedDay.day === day.name);
  }

  deleteAllowedDay(allowedDay: AccessApiAllowedDay): void {
    const updatedDays = this.allowedDays.filter(dp => dp.day !== allowedDay.day);
    this.visitorService.updateAllowedDays(updatedDays);
  }

  formatHour(schedule: AccessApiAllowedDay): string {
    const padNumber = (num: number) => num.toString().padStart(2, '0');
    const initFormatted = `${padNumber(schedule.init_hour[0])}:${padNumber(schedule.init_hour[1])}`;
    const endFormatted = `${padNumber(schedule.end_hour[0])}:${padNumber(schedule.end_hour[1])}`;
    return `${initFormatted} - ${endFormatted}`;
  }
  validateDates(): boolean {
    console.log('Validando fechas');
    console.log('Valor de startDate:', this.form.value.startDate);
    console.log('Valor de endDate:', this.form.value.endDate);
  

    if (!this.form.value.startDate || !this.form.value.endDate) {
      console.log('Fechas no proporcionadas');
      Swal.fire({
        icon: 'error',
        title: 'Fecha inválida',
        text: 'Por favor, ingrese ambas fechas.',
      });
      return false;
    }
  

    const startDate = new Date(this.form.value.startDate + 'T00:00:00');
    const endDate = new Date(this.form.value.endDate + 'T00:00:00');
  
    console.log('Fechas parseadas:', {
      startDate,
      endDate,
      isStartDateValid: !isNaN(startDate.getTime()),
      isEndDateValid: !isNaN(endDate.getTime())
    });
  
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
  

    if (startDate < currentDate && !this._isFromParent) {
  console.log('Fecha de inicio anterior a la fecha actual');
  Swal.fire({
    icon: 'error',
    title: 'Fecha inválida',
    text: 'La fecha de inicio no puede ser anterior a la fecha actual.',
  });
  return false;
}
  
    if (endDate < currentDate) {
      console.log('Fecha de fin anterior a la fecha actual');
      Swal.fire({
        icon: 'error',
        title: 'Fecha inválida',
        text: 'La fecha de fin no puede ser anterior a la fecha actual.',
      });
      return false;
    }
  
    if (endDate < startDate) {
      console.log('Fecha de fin anterior a fecha de inicio');
      Swal.fire({
        icon: 'error',
        title: 'Fecha inválida',
        text: 'La fecha de fin no puede ser anterior a la fecha de inicio.',
      });
      return false;
    }
  
    console.log('Validación de fechas exitosa');
    return true;
  }
  getDayNameInSpanish(englishDay: string): string {
    const dayMap: { [key: string]: string } = {
      'MONDAY': 'Lun',
      'TUESDAY': 'Mar',
      'WEDNESDAY': 'Mié',
      'THURSDAY': 'Jue',
      'FRIDAY': 'Vie',
      'SATURDAY': 'Sáb',
      'SUNDAY': 'Dom'
    };
    return dayMap[englishDay] || englishDay;
  }
  getDayName(englishDay: string): string {
    const dayMap: { [key: string]: string } = {
      'Lun': 'MONDAY',
      'Mar': 'TUESDAY',
      'Mié': 'WEDNESDAY',
      'Jue': 'THURSDAY',
      'Vie': 'FRIDAY',
      'Sáb': 'SATURDAY',
      'Dom': 'SUNDAY'
    };
    return dayMap[englishDay] || englishDay;
  }

  private validateDuplicateDays(daysToAdd: AccessApiAllowedDay[]): boolean {
    const duplicates = daysToAdd.filter(newDay => 
      this._allowedDays.some(existingDay => 
        existingDay.day === newDay.day &&
        existingDay.init_hour[0] === newDay.init_hour[0] &&
        existingDay.init_hour[1] === newDay.init_hour[1] &&
        existingDay.end_hour[0] === newDay.end_hour[0] &&
        existingDay.end_hour[1] === newDay.end_hour[1]
      )
    );

    if (duplicates.length > 0) {
      const duplicateDays = duplicates
        .map(day => this.getDayNameInSpanish(day.day))
        .join(', ');
      
      Swal.fire({
        icon: 'warning',
        title: 'Días duplicados',
        text: `Los siguientes días ya están agregados con el mismo horario: ${duplicateDays}`
      });
      return false;
    }
    return true;
  }

}

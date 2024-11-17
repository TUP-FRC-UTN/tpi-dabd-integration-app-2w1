import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup,FormArray, ReactiveFormsModule, Validators, NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LlamadoAtencionService } from "../../services/llamado-atencion.service";
import { EmployeeGetResponseDTO } from "../../Models/llamado-atencion";
import { Router } from '@angular/router';
import { Output, Input} from "@angular/core";
import { EventEmitter } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { RequestWakeUpCallDTO, RequestWakeUpCallGroupDTO } from "../../Models/llamado-atencion";
import { ListadoDesempeñoService } from "../../services/listado-desempeño.service";
import Swal from 'sweetalert2';
import { UsersMockIdService } from "../../../common-services/users-mock-id.service";

@Component({
  selector: 'app-iep-attention-call',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, FormsModule],
  templateUrl: './iep-attention-call.component.html',
  styleUrl: './iep-attention-call.component.css'
})
export class IepAttentionCallComponent implements OnInit{
  @Input() employeeId: number | null = null; // Propiedad de entrada para el ID del empleado
  employeeName: string = ''; // Para almacenar el nombre del empleado
  @Output() closeModal = new EventEmitter<void>();
  @Output() showConfirmationMessage = new EventEmitter<string>();
  @Output() showErrorMessage = new EventEmitter<string>();
  wakeUpCallForm: FormGroup;
  confirmationMessage: string = '';
  errorMessage: string = '';
  showConfirmation: boolean = false;
  showError: boolean = false;
  employees: EmployeeGetResponseDTO[] = [];
  filteredEmployees: EmployeeGetResponseDTO[] = [];
  selectedEmployeeIds: Set<number> = new Set<number>();
  formSubmitted: boolean = false;
  fechaMaxima: string;
  UpdateUser: number= 0;
  createduser: number= 0;
  
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private wakeUpCallService: LlamadoAtencionService,
    private ListDesempeño: ListadoDesempeñoService,
    private UsersMockIdService: UsersMockIdService
  ) {
    const hoy = new Date();
    this.fechaMaxima = hoy.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    this.wakeUpCallForm = this.fb.group({
      fecha: [today, [Validators.required, this.fechaMaximaValidator]],
      desempeno: ['', Validators.required],
      observaciones: ['', [Validators.required, Validators.maxLength(200)]]
    });
    
  }


  ngOnInit() {
    this.loadEmployees();
    console.log('ID del empleado:', this.employeeId);
    this.UpdateUser = this.UsersMockIdService.getMockId();
    this.createduser = this.UsersMockIdService.getMockId();
    
  }

  fechaMaximaValidator(control: any) {
    const today = new Date().toISOString().split('T')[0];
    return control.value > today ? { maxDate: true } : null;
  }

  loadEmployees() {
    this.wakeUpCallService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.filterEmployees();
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  filterEmployees() {
    const searchTerm = this.wakeUpCallForm.get('searchTerm')?.value?.toLowerCase() || '';
    this.filteredEmployees = this.employees.filter(employee =>
      employee.fullName.toLowerCase().includes(searchTerm)
    );
  }

  toggleEmployeeSelection(employeeId: number) {
    if (this.selectedEmployeeIds.has(employeeId)) {
      this.selectedEmployeeIds.delete(employeeId);
    } else {
      this.selectedEmployeeIds.add(employeeId);
    }
  }

  clearEmployeeSelection() {
    this.selectedEmployeeIds.clear();
  }

  resetForm() {
    this.formSubmitted = false;
    this.wakeUpCallForm.reset();
    this.clearEmployeeSelection();
    const today = new Date().toISOString().split('T')[0];
    this.wakeUpCallForm.patchValue({ fecha: today });
  }

  
  showSuccessMessage(message: string) {
    this.confirmationMessage = message;
    this.showConfirmation = true;
  }


  closeErrorModal() {
    this.showError = false;
  }

  closeConfirmationModal() {
    this.showConfirmation = false;
    this.router.navigate(['/llamados']);
  }

  // Nuevo método para manejar mensajes de error
  private getErrorMessage(error: HttpErrorResponse): string {
    const serverMessage = error.error?.message || '';
    
    switch (error.status) {
      case 409:
        return serverMessage || 'Ya existe un llamado de atención para el empleado en la fecha seleccionada';
      case 400:
        if (serverMessage.includes('fecha futura')) {
          return 'No se pueden registrar llamados de atención con fecha futura';
        } else if (serverMessage.includes('Empleado no encontrado')) {
          return 'Uno o más empleados seleccionados no fueron encontrados en el sistema';
        }
        return serverMessage || 'Error en los datos ingresados. Por favor, verifique la información';
      case 404:
        return 'No se encontró el recurso solicitado';
      case 403:
        return 'No tiene permisos para realizar esta acción';
      case 500:
        return 'Error interno del servidor. Por favor, intente nuevamente más tarde';
      default:
        return serverMessage || 'Ha ocurrido un error. Por favor, intente nuevamente';
    }
  }

  handleError(error: HttpErrorResponse) {
    const serverMessage = error.error?.message || '';
    let errorMessage: string;

    switch (error.status) {
      case 409:
        errorMessage = serverMessage || 'Ya existe un llamado de atención para el empleado en la fecha seleccionada';
        break;
      case 400:
        if (serverMessage.includes('fecha futura')) {
          errorMessage = 'No se pueden registrar llamados de atención con fecha futura';
        } else if (serverMessage.includes('Empleado no encontrado')) {
          errorMessage = 'Uno o más empleados seleccionados no fueron encontrados en el sistema';
        } else {
          errorMessage = serverMessage || 'Error en los datos ingresados. Por favor, verifique la información';
        }
        break;
      case 404:
        errorMessage = 'No se encontró el recurso solicitado';
        break;
      case 403:
        errorMessage = 'No tiene permisos para realizar esta acción';
        break;
      case 500:
        errorMessage = 'Error interno del servidor. Por favor, intente nuevamente más tarde';
        break;
      default:
        errorMessage = serverMessage || 'Ha ocurrido un error. Por favor, intente nuevamente';
    }

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3085d6'
    });

    console.error('Error detallado:', {
      status: error.status,
      message: error.error?.message,
      error: error
    });
  }

  onSubmit() {
    this.formSubmitted = true;
  
    // Verificar si el formulario es válido y si hay un empleado seleccionado
    if (this.wakeUpCallForm.valid && this.employeeId !== null) {
      const formValues = this.wakeUpCallForm.value;
  
      const request: RequestWakeUpCallGroupDTO = {
        empleadoIds: [this.employeeId], // Usar el employeeId directamente
        fecha: formValues.fecha,
        desempeno: formValues.desempeno,
        observation: formValues.observaciones,
        lastUpdateUser: this.UpdateUser,
        created_user: this.createduser
      };
  
      this.wakeUpCallService.crearWakeUpCallGrupo(request).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: '¡Llamado de atención registrado exitosamente!',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6'
          }).then((result) => {
            if (result.isConfirmed) {
              this.resetForm();
              this.closeModal.emit();
              this.router.navigate(['/llamados']);
            }
          });
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error);
        }
      });
    } else {
      // Si no hay un empleado seleccionado, mostrar un mensaje de advertencia
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Debe seleccionar un empleado',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6'
      });
    }
  }
}

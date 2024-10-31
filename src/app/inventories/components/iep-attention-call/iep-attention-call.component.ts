import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup,FormArray, ReactiveFormsModule, Validators, NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LlamadoAtencionService } from "../../services/llamado-atencion.service";
import { EmployeeGetResponseDTO } from "../../models/llamado-atencion";
import { Router } from '@angular/router';
import { HttpErrorResponse } from "@angular/common/http";
import { RequestWakeUpCallDTO, RequestWakeUpCallGroupDTO } from "../../models/llamado-atencion";
import { ListadoDesempeñoService } from "../../services/listado-desempeño.service";

@Component({
  selector: 'app-iep-attention-call',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, FormsModule],
  templateUrl: './iep-attention-call.component.html',
  styleUrl: './iep-attention-call.component.css'
})
export class IepAttentionCallComponent implements OnInit{
  wakeUpCallForm: FormGroup;
  confirmationMessage: string = '';
  errorMessage: string = '';
  showConfirmation: boolean = false;
  showError: boolean = false;
  employees: EmployeeGetResponseDTO[] = [];
  filteredEmployees: EmployeeGetResponseDTO[] = [];
  dateFilteredEmployees: EmployeeGetResponseDTO[] = [];
  selectedEmployeeIds: Set<number> = new Set<number>(); // Control de empleados seleccionados
  searchTerm: string = '';
  formSubmitted: boolean = false; // Nueva propiedad para controlar el estado de envío

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private wakeUpCallService: LlamadoAtencionService,
    private ListDesempeño: ListadoDesempeñoService
  ) {
    this.wakeUpCallForm = this.fb.group({
      fecha: ['', Validators.required],
      desempeno: ['', Validators.required],
      observaciones: ['', Validators.required],
      searchTerm: ['', [Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    this.loadEmployees();

    this.wakeUpCallForm.get('fecha')?.valueChanges.subscribe(date => {
      if (date) {
        this.loadEmployeesForDate(date);
      } else {
        this.clearEmployeeSelection();
      }
    });

    this.wakeUpCallForm.get('searchTerm')?.valueChanges.subscribe(() => {
      this.filterEmployees();
    });
  }

  loadEmployees() {
    this.wakeUpCallService.getAllEmployees().subscribe(
      (employees) => {
        this.employees = employees;
        const fecha = this.wakeUpCallForm.get('fecha')?.value;
        if (fecha) {
          this.loadEmployeesForDate(fecha);
        } else {
          this.clearEmployeeSelection();
        }
      },
      (error) => {
        console.error('Error al cargar empleados', error);
        this.showErrorMessage('Error al cargar la lista de empleados');
      }
    );
  }

  loadEmployeesForDate(date: string) {
    this.wakeUpCallService.getMovements(date).subscribe(
      (documents) => {
        this.dateFilteredEmployees = this.employees.filter(employee =>
          documents.includes(employee.document)
        );
        this.filterEmployees();
      },
      (error) => {
        console.error('Error al cargar movimientos', error);
        this.showErrorMessage('Error al cargar los movimientos de empleados');
      }
    );
  }

  filterEmployees() {
    const searchTerm = this.wakeUpCallForm.get('searchTerm')?.value?.toLowerCase() || '';
    const employeesToFilter = this.dateFilteredEmployees.length > 0
      ? this.dateFilteredEmployees
      : this.employees;

    this.filteredEmployees = searchTerm.length >= 3
      ? employeesToFilter.filter(employee => employee.fullName.toLowerCase().includes(searchTerm))
      : employeesToFilter;

    this.clearEmployeeSelection();
  }

  // Controlar selección de empleados
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

  onSubmit() {
    this.formSubmitted = true; // Marcar el formulario como enviado

    if (this.wakeUpCallForm.valid) {
      const formValues = this.wakeUpCallForm.value;
      const selectedEmployeeIds = Array.from(this.selectedEmployeeIds);

      if (selectedEmployeeIds.length === 0) {
        this.showErrorMessage('Debe seleccionar al menos un empleado');
        return;
      }

      const request: RequestWakeUpCallGroupDTO = {
        empleadoIds: selectedEmployeeIds,
        fecha: formValues.fecha,
        desempeno: formValues.desempeno,
        observation: formValues.observaciones,
        lastUpdateUser: 1,
        created_user: 1
      };

      this.wakeUpCallService.crearWakeUpCallGrupo(request).subscribe(
        response => {
          console.log('WakeUpCall grupal creado', response);
          this.showSuccessMessage('¡Llamado registrado exitosamente!');
          this.ListDesempeño.refreshData(); // Refrescar la lista de desempeño
          this.actualizar(); // Llama a actualizar aquí si es necesario
          this.resetForm();
        },
        error => {
          console.error('Error al registrar', error);
          this.showErrorMessage('Error al registrar el llamado');
        }
      );
    }
  }

  private showSuccessMessage(message: string) {
    this.confirmationMessage = message;
    this.showConfirmation = true;
    this.showError = false;
    setTimeout(() => this.showConfirmation = false, 3000);
  }

  private showErrorMessage(error: string) {
    this.errorMessage = error;
    this.showError = true;
    this.showConfirmation = false;
    setTimeout(() => this.showError = false, 5000);
  }

  private resetForm() {
    this.wakeUpCallForm.reset();
    this.clearEmployeeSelection();
    this.formSubmitted = false; // Reiniciar el estado de envío
  }

  navigateToPerformanceList(): void {
    this.router.navigate(['/listado-empleados']);
  }

  actualizar() {
    this.ListDesempeño.getCombinedData().subscribe(
      (data) => {
        console.log('Datos de desempeño actualizados:', data);
        // Aquí puedes manejar los datos de desempeño como desees
      },
      (error) => {
        console.error('Error al actualizar datos de desempeño:', error);
        this.showErrorMessage('Error al actualizar datos de desempeño');
      }
    );
  }
  
}

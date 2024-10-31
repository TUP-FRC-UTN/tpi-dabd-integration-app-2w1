import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service';
import { EmpPostEmployeeService } from '../../services/emp-post-employee.service';
import { Provincia } from '../../models/emp-provincia';
import { Charge } from '../../models/emp-post-employee-dto';
import { EmpPutEmployees } from '../../models/emp-put-employees';
declare var bootstrap: any;

@Component({
  selector: 'app-iep-put-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './iep-put-employees.component.html',
  styleUrls: ['./iep-put-employees.component.css']
})
export class IepPutEmployeesComponent implements OnInit {
  // Variables para datos personales
  nombre: string = '';
  apellido: string = '';
  dni: string = '';
  cuil: string = '';
  
  // Variables para contacto
  telefono: string = '';
  mail: string = '';
  
  // Variables para dirección
  provincias: Provincia[] = [];
  provinciaSelect: Provincia | undefined;
  localidadSelect: string = '';
  calle: string = '';
  numeroCalle: string = '';
  piso: string = '';
  dpto: string = '';
  codigoPostal: string = '';
  
  // Variables para empleado tercerizado
  terciorizedEmployee: boolean = false;
  license: boolean = false;
  suppliers: any[] = [];
  selectedSupplier: any;
  
  // Variables para cargo y salario
  cargos: Charge[] = [];
  cargoSelected: Charge | undefined;
  salario: number = 0;
  startTimeContract: Date | undefined;
  
  // Variables para días laborales
  lunes: boolean = false;
  martes: boolean = false;
  miercoles: boolean = false;
  jueves: boolean = false;
  viernes: boolean = false;
  sabado: boolean = false;
  domingo: boolean = false;
  
  // Variables para horarios
  horaEntrada: string = '';
  horaSalida: string = '';

  private employeeId: number = 0;

  @ViewChild('confirmModal') confirmModal?: ElementRef;
  @ViewChild('errorModal') errorModal?: ElementRef;
  modalMessage: string = '';
  modalTitle: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private empleadoService: EmpListadoEmpleadosService,
    private postEmployeeService: EmpPostEmployeeService,
  ) {}

  ngOnInit(): void {
    // Obtener el ID del empleado de la URL
    console.log("llegueee")
    this.route.params.subscribe(params => {
      this.employeeId = +params['id'];
      this.loadEmployeeData();
    });

    // Cargar datos necesarios
    this.loadProvincias();
    this.loadSuppliers();
    this.loadCargos();
  }

  loadEmployeeData(): void {
    this.empleadoService.getEmployeeById2(this.employeeId).subscribe({
      next: (employee) => {
        // Cargar datos personales
        this.nombre = employee.name || '';
        this.apellido = employee.surname || '';
        this.dni = employee.documenValue || '';
        this.cuil = employee.cuil || '';
        
        // Cargar contacto
       // this.telefono = employee..toString() || '';
       // this.mail = employee|| '';
        
        // Cargar dirección
        if (employee.adressDto) {
          this.calle = employee.adressDto.street || '';
          this.numeroCalle = employee.adressDto.number_street?.toString() || '';
          this.piso = employee.adressDto.floor?.toString() || '';
          this.dpto = employee.adressDto.apartment || '';
          this.codigoPostal = employee.adressDto.postal_code || '';
          this.localidadSelect = employee.adressDto.locality || '';
          // La provincia se seleccionará cuando se carguen las provincias
        }
        
        // Cargar datos de empleo
        this.salario = employee.salary || 0;
        this.startTimeContract = employee.contractStartTime;
        this.license = employee.license || false;
        
        // Cargar días laborales
        this.lunes = employee.mondayWorkday || false;
        this.martes = employee.tuesdayWorkday || false;
        this.miercoles = employee.wednesdayWorkday || false;
        this.jueves = employee.thursdayWorkday || false;
        this.viernes = employee.fridayWorkday || false;
        this.sabado = employee.saturdayWorkday || false;
        this.domingo = employee.sundayWorkday || false;
        
        // Cargar horarios
        this.horaEntrada = employee.startTime || '';
        this.horaSalida = employee.endTime || '';
        
        // Cargar proveedor si es tercerizado
        if (employee.supplierId) {
          this.terciorizedEmployee = true;
          // El proveedor se seleccionará cuando se carguen los proveedores
        }
      },
      error: (error) => {
        console.error('Error al cargar los datos del empleado:', error);
      }
    });
  }

  loadProvincias(): void {
    this.postEmployeeService.getProvinces().subscribe({
      next: (data) => {
        this.provincias = data;
      },
      error: (error) => {
        console.error('Error al cargar provincias:', error);
      }
    });
  }

  loadSuppliers(): void {
    this.postEmployeeService.getProviders().subscribe({
      next: (data) => {
        this.suppliers = data;
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
      }
    });
  }

  loadCargos(): void {
    this.postEmployeeService.getCharges().subscribe({
      next: (data) => {
        this.cargos = data;
      },
      error: (error) => {
        console.error('Error al cargar cargos:', error);
      }
    });
  }


  loadLocalidades(): void {
    // Esta función se llama cuando cambia la provincia seleccionada
    // La lógica ya está implementada en el template con el ngModel
  }

  changeTerceorized(): void {
    this.terciorizedEmployee = !this.terciorizedEmployee;
  }

  validateDate(): void {
    // Implementar validación de fecha si es necesario
  }
  private formatTime(time: string): string {
    // Asegurarse de que el tiempo esté en formato HH:mm:ss
    if (!time.includes(':')) {
      return time + ':00';
    }
    return time;
  }
  showModal(type: 'confirm' | 'error', message: string): void {
    this.modalMessage = message;
    this.modalTitle = type === 'confirm' ? 'Confirmación' : 'Error';
    
    const modalElement = type === 'confirm' ? 
      this.confirmModal?.nativeElement : 
      this.errorModal?.nativeElement;
    
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  onSubmit(form: any): void {
    if (form.valid) {
      const employeeData: EmpPutEmployees = {
        id: this.employeeId,
        name: this.nombre,
        surname: this.apellido,
        documenValue: this.dni,
        cuil: this.cuil,
        charge: this.cargoSelected?.id,
        contractStartTime: this.startTimeContract,
        salary: this.salario,
        //active: true,
        license: this.license,
        mondayWorkday: this.lunes,
        tuesdayWorkday: this.martes,
        wednesdayWorkday: this.miercoles,
        thursdayWorkday: this.jueves,
        fridayWorkday: this.viernes,
        saturdayWorkday: this.sabado,
        sundayWorkday: this.domingo,
        startTime: this.formatTime(this.horaEntrada),
        endTime: this.formatTime(this.horaSalida),
        supplierId: this.terciorizedEmployee ? this.selectedSupplier?.id : undefined,
        emailValue: this.mail || '',
        telephoneValue: parseInt(this.telefono),
        adressDto: {
          street: this.calle,
          number_street: parseInt(this.numeroCalle),
          apartment: this.dpto,
          floor: parseInt(this.piso),
          postal_code: this.codigoPostal,
          city: this.provinciaSelect?.nombre,
          locality: this.localidadSelect
        },
      };
      this.postEmployeeService.updateEmployee(employeeData).subscribe({
        next: (response) => {
          this.showModal('confirm', 'Empleado actualizado exitosamente');
          // Esperar a que el usuario cierre el modal antes de navegar
          const modalElement = this.confirmModal?.nativeElement;
          modalElement.addEventListener('hidden.bs.modal', () => {
            this.router.navigate(['/empleados/listado']);
          });
        },
        error: (error: any) => {
          if (error.status === 404) {
            this.showModal('error', 'Empleado no encontrado');
          } else if (error.status === 500) {
            this.showModal('error', 'Error al actualizar empleado 500');
          } else {
            this.showModal('error', error.message);
          }
          console.error('Error al actualizar el empleado:', error);
        }
      });
    }
  }

  
  cancelar(): void {
    this.router.navigate(['/empleados/listado']);
  }
 
}
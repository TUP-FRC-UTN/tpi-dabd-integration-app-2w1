import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OwnerService } from '../../../users-servicies/owner.service';
import { Owner } from '../../../users-models/owner/Owner';
import Swal from 'sweetalert2';
import { PutOwnerDto } from '../../../users-models/owner/PutOwnerDto';
import { FileService } from '../../../users-servicies/file.service';
import { FileDto } from '../../../users-models/owner/FileDto';
import { OwnerPlotUserDto, PlotDtoForOwner } from '../../../users-models/owner/OwnerPlotUserDto';
import { OwnerTypeModel } from '../../../users-models/owner/OwnerType';
import { OwnerStateModel } from '../../../users-models/owner/OwnerState';
import { lastValueFrom } from 'rxjs';
import { DniTypeModel } from '../../../users-models/owner/DniTypeModel';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import { PlotService } from '../../../users-servicies/plot.service';
import { GetPlotModel } from '../../../users-models/plot/GetPlot';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-users-update-owner',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CustomSelectComponent, NgSelectComponent],
  templateUrl: './users-update-owner.component.html',
  styleUrl: './users-update-owner.component.css'
})
export class UsersUpdateOwnerComponent implements OnInit {
  owner: Owner = new Owner();
  plotsForOwner: PlotDtoForOwner[] = [];
  existingFiles: File[] = [];
  files: File[] = [];
  existingFilesDownload: FileDto[] = [];
  id: string = "";
  types: OwnerTypeModel[] = [];
  dniTypes: DniTypeModel[] = [];
  // states: OwnerStateModel[] = []; -----------------------------VER
  states: any[] = [];
  stateOptions: any[] = [];
  stateSelected: string = '';
  juridicId = 2;
  plotsOptions: any[] = [];
  plots: String[] = [];
  editOwner : FormGroup;

  private readonly ownerService = inject(OwnerService)
  private readonly plotService = inject(PlotService)
  private readonly fileService = inject(FileService);

  constructor(private router: Router, private route: ActivatedRoute, private fb : FormBuilder) { 
    this.editOwner = this.fb.group({
      name: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    lastname: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    dni: new FormControl("", [Validators.required, Validators.minLength(8), Validators.pattern(/^\d+$/)]),
    dniType: new FormControl("", [Validators.required]),
    ownerType: new FormControl("", [Validators.required]),
    taxStatus: new FormControl("", [Validators.required]),
    bussinesName: new FormControl(""),
    birthdate: new FormControl("", [Validators.required, this.dateLessThanTodayValidator()]),
    phoneNumber: new FormControl("", [Validators.required, Validators.minLength(10), Validators.maxLength(20), Validators.pattern(/^\d+$/)]),
    email: new FormControl("", [Validators.required, Validators.email]),
    state: new FormControl(0, [Validators.required]),
    plots: new FormControl([])
    })
  }

  async ngOnInit(): Promise<void> {

    const typeControl = this.editOwner.get('ownerType');
    if (typeControl) {
      typeControl.valueChanges.subscribe(value => {
        this.toggleCompanyField(String(value ?? ""));
      });
    }
    // Obtener el ID del propietario
    this.id = this.route.snapshot.paramMap.get('id') || '';

    try {
      // Esperar a que se cargue el propietario
      const data: OwnerPlotUserDto = await lastValueFrom(this.ownerService.getByIdWithUser(Number(this.id)));
      this.owner = data.owner;
      this.plotsForOwner = data.plot;
      

      // Rellenar los campos del formulario con los datos del propietario
      this.editOwner.patchValue({
        name: this.owner.name,
        lastname: this.owner.lastname,
        dni: this.owner.dni,
        dniType: this.owner.dni_type,
        ownerType: this.owner.ownerType, // Valor inicial para ownerType
        taxStatus: this.owner.taxStatus, // Valor inicial para taxStatus
        bussinesName: this.owner.businessName,
        phoneNumber: data.user.phone_number,
        email: data.user.email,
        state: data.owner.taxStatus, //?????????????????????????????????????????????????
        plots: data.user.plot_id
      });

      // Manejo de archivos, si existen
      if (this.owner.files?.length) {
        this.owner.files.forEach((fileDto) => {
          this.fileService.getFile(fileDto.uuid).subscribe(
            ({ blob, filename }) => {
              const newFile = new File([blob], filename, { type: blob.type });
              this.existingFiles.push(newFile);
            },
            (error) => {
              console.error(`Error al descargar el archivo ${fileDto.uuid}`, error);
            }
          );
        });
      }

      // Formateo de la fecha de nacimiento
      const formattedDate = this.parseDateString(this.owner.dateBirth);
      this.editOwner.patchValue({
        birthdate: formattedDate ? this.formatDate(formattedDate) : ''
      });

    } catch (error) {
      console.error('Error al cargar el propietario:', error);
    }

    this.plotService.getPlotsByOwnerId(Number(this.id)).subscribe({
      next: (data: GetPlotModel[]) => {
        this.plots = data.map(plot => "Lote: " + plot.plot_number + ", " + "Manzana: " + plot.block_number);
      },
      error: (err) => {
        console.error('Error al cargar los terrenos del propietario:', err);
      },
    })

    this.plotService.getAllPlots().subscribe({
      next: (data: GetPlotModel[]) => {
        // Crear las opciones del select
        console.log(data);
        
        let plotsAvailables: GetPlotModel[] = data.filter(plot => plot.plot_state === 'Disponible' || this.plotsForOwner.some(p => p.id === plot.id));

        console.log(plotsAvailables);
        

        this.plotsOptions = plotsAvailables.map(d => ({
          value: d.id,
          name: `Lote: ${d.plot_number}, Manzana: ${d.block_number}`
        }));
        

        // Aquí puedes setear valores iniciales si es necesario. Por ejemplo:
        const selectedPlots = data // Aquí, 'data' es la lista completa de plots
          .filter(plot => this.plotsForOwner?.some(p => p.id === plot.id)) // Filtrar los plots seleccionados
          .map(plot => plot.id); // Extraer los IDs de los seleccionados

        this.editOwner.get('plots')!.setValue(selectedPlots);
      },
      error: (err) => {
        console.error('Error al cargar los terrenos:', err);
      }
    });


    

    // Cargar las opciones para los selectores
    await this.ownerService.getAllTypes().subscribe({
      next: (data: OwnerTypeModel[]) => {
        this.types = data;

        this.types.forEach((type) => {
          if (type.description === this.owner.ownerType) {
            this.editOwner.patchValue({
              ownerType: type.id.toString(),
            });
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar los tipos de propietario:', err);
      },
    });

    this.ownerService.getAllDniTypes().subscribe({
      next: (data: DniTypeModel[]) => {
        this.dniTypes = data;
        this.dniTypes.forEach((dni_type) => {
          if (dni_type.description === this.owner.dni_type) {
            this.editOwner.patchValue({
              dniType: dni_type.id.toString(),
            });
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar los estados fiscales:', err);
      },
    });

    this.ownerService.getAllStates().subscribe({
      next: (data: OwnerStateModel[]) => {
        this.states = data;
        this.states.forEach((state) => {
          if (state.description === this.owner.taxStatus) {
            this.editOwner.get('state')!.setValue(state.id);
          }
        });

        this.editOwner.get('state')!.valueChanges.subscribe(value => {
          this.stateSelected = value!.toString();
        });

        this.stateOptions = data.map(d => ({ value: d.id, name: d.description }));


      },
      error: (err) => {
        console.error('Error al cargar los estados fiscales:', err);
      },
    });

    this.editOwner.get('dni')?.disable();
    this.editOwner.get('dniType')?.disable();
    this.editOwner.get('email')?.disable();
    this.editOwner.get('birthdate')?.disable();

  }

  redirect(url: string) {
    this.router.navigate([`${url}`]);
  }

  private toggleCompanyField(ownerType: string) {
    if (ownerType === this.juridicId.toString()) {
      this.editOwner.get('bussinesName')?.enable();
    } else {
      this.editOwner.get('bussinesName')?.disable();
      this.editOwner.get('bussinesName')?.setValue(""); // Limpiar el campo si se deshabilita
    }
  }

  createObject(form: any) {
    return {
      name: form.get('name')?.value,
      lastname: form.get('lastname')?.value,
      dni: form.get('dni')?.value,
      dateBirth: form.get('birthdate')?.value,
      ownerTypeId: form.get('ownerType')?.value,
      taxStatusId: Number(form.get('state').value),
      dniTypeId: form.get('dniType')?.value,
      businessName: form.get('bussinesName')?.value,
      phoneNumber: form.get('phoneNumber')?.value,
      email: form.get('email')?.value,
      files: this.files,
      userUpdateId: 1,
      active: true,
      plotId: form.get('plots')?.value
    } as PutOwnerDto
  }

  getFiles(files: File[]) {
    this.files = files;
  }

  updateOwner(form: any) {
    if (form.valid) {

      //se crea el objeto
      let ownerPut = this.createObject(form);
      
      console.log(ownerPut);

      


      //llama al service
      this.ownerService.putOwner(ownerPut, Number(this.id)).subscribe({
        next: (response) => {

          //mostrar alerta
          Swal.fire({
            icon: "success",
            title: "Se han guardado los cambios",
            showConfirmButton: false,
            timer: 1000
          });

          //redirigir a la lista
          this.redirect('home/owners/list');
        },
        error: (error) => {
          console.log(error);

          //mostrar alerta de error
          Swal.fire({
            icon: "error",
            title: "Ha ocurrido un error",
            showConfirmButton: false,
            timer: 1000
          });
        }
      })
    }
    console.log("no era valido");

  }

  confirmExit() {
    this.editOwner.reset();
    this.redirect('/home/owners/list');
  }

  private parseDateString(dateString: string): Date | null {
    const [day, month, year] = dateString.split('-').map(Number);
    if (!day || !month || !year) {
      return null;
    }
    // Crea un objeto Date con formato "yyyy-MM-dd"
    return new Date(year, month - 1, day); // Restamos 1 al mes porque en JavaScript los meses son 0-indexed
  }

  // Formatea una fecha en "yyyy-MM-dd"
  private formatDate(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }


  downloadFile(fileId: string) {
    this.fileService.getFile(fileId).subscribe(({ blob, filename }) => {
      // Crear una URL desde el Blob
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace de descarga dinámico
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;  // Nombre del archivo obtenido desde el encabezado
      document.body.appendChild(a);
      a.click();  // Simular el clic para descargar el archivo

      // Limpiar el DOM y liberar el Blob después de la descarga
      window.URL.revokeObjectURL(url);
      a.remove();
    }, error => {
      console.error('Error al descargar el archivo', error);
    });
  }

  dateLessThanTodayValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate >= today ? { dateTooHigh: true } : null;
    }
  }

  onValidate(controlName: string) {
    const control = this.editOwner.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }

  showError(controlName: string): string {
    const control = this.editOwner.get(controlName);

    if (!control || !control.errors) return '';

    const errorKey = Object.keys(control.errors)[0];
    const errorMessages: { [key: string]: string } = {
      required: 'Este campo no puede estar vacío.',
      email: 'Formato de correo electrónico inválido.',
      minlength: `El valor ingresado es demasiado corto. Mínimo ${control.errors['minlength']?.requiredLength} caracteres.`,
      maxlength: `El valor ingresado es demasiado largo. Máximo ${control.errors['maxlength']?.requiredLength} caracteres.`,
      pattern: 'El formato ingresado no es válido.',
      min: `El valor es menor que el mínimo permitido (${control.errors['min']?.min}).`,
      max: `El valor es mayor que el máximo permitido (${control.errors['max']?.max}).`,
      requiredTrue: 'Debe aceptar el campo requerido para continuar.',
      dateTooHigh: 'La fecha ingresada debe ser anterior al día de hoy.',
      url: 'El formato de URL ingresado no es válido.',
      number: 'Este campo solo acepta números.',
      customError: 'Error personalizado: verifique el dato ingresado.',
    };

    return errorMessages[errorKey] || 'Error no identificado en el campo.';
  }

  //Evento para actualizar el listado de files a los seleccionados actualmente
  onFileChange(event: any) {
    this.files.push(...Array.from(event.target.files as FileList)); //Convertir FileList a Array
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  getStatus(state: any) {
    this.stateSelected = state;
  }
}

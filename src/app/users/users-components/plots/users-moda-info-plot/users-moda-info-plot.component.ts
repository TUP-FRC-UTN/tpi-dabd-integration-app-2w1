import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GetPlotModel } from '../../../users-models/plot/GetPlot';
import { FileDto } from '../../../users-models/owner/FileDto';
import { FileService } from '../../../users-servicies/file.service';
import { OwnerService } from '../../../users-servicies/owner.service';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';

@Component({
  selector: 'app-users-moda-info-plot',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './users-moda-info-plot.component.html',
  styleUrl: './users-moda-info-plot.component.css'
})
export class UsersModaInfoPlotComponent implements OnInit, OnDestroy {

  @Input() plotModel: GetPlotModel = new GetPlotModel();

  plotForm: FormGroup;
  filesPlot: FileDto[];

  ownerName: string = '';           // Para almacenar el nombre del propietario
  ownerLastName: string = '';      // Para almacenar el apellido del propietario
  ownerDNI: string = '';          // Para almacenar el DNI del propietario
  ownerType: string = ''         //Tipo de propietario

  private readonly ownerService = inject(OwnerService);
  private readonly fileService = inject(FileService);
  private readonly suscriptionService = inject(SuscriptionManagerService);

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {
    this.plotForm = this.fb.group({
      plot: [''],
      block: [''],
      total_area: [''],
      built_area: [''],
      state: [''],
      type: ['']
    });
    this.filesPlot = [];
  }

  // Método para detectar cambios en el @Input
  ngOnInit() {        
      this.plotForm.patchValue({
        plot: this.plotModel.plot_number  ,
        block: this.plotModel.block_number,
        total_area: this.plotModel.total_area_in_m2,
        built_area: this.plotModel.built_area_in_m2,
        state: this.plotModel.plot_state,
        type: this.plotModel.plot_type
      });
      this.plotForm.disable();
      this.filesPlot = this.plotModel.files;

      // Obtener información del propietario
      this.getOwnerByPlotId(this.plotModel.id);
  }

  ngOnDestroy(): void {
    this.suscriptionService.unsubscribeAll();
  }

  //Obtiene el propietario por id
  getOwnerByPlotId(id: number) {
    const sus = this.ownerService.getOwnerByPlotId(this.plotModel.id).subscribe({
      next: (owners) => {
        if (owners.length > 0) {
          this.ownerName = owners[0].name;
          this.ownerLastName = owners[0].lastname;
          this.ownerDNI = owners[0].dni;
          this.ownerType = owners[0].ownerType;
        }
      },
      error: (error) => {
        console.error('Error al obtener el propietario:', error);
      }
    });

    //Agregar suscripcion
    this.suscriptionService.addSuscription(sus);
  }

  //Cierra el modal
  closeModal(){
    this.activeModal.close();
  }

  //Descarga los archivos
  downloadFile(fileId: string) {
    this.fileService.downloadFile(fileId);
  }
}

import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Owner } from '../../../users-models/owner/Owner';
import { FileService } from '../../../users-servicies/file.service';
import { FileDto } from '../../../users-models/owner/FileDto';
import { CommonModule } from '@angular/common';
import { PlotService } from '../../../users-servicies/plot.service';
import { GetPlotDto } from '../../../users-models/plot/GetPlotDto';
import { OwnerService } from '../../../users-servicies/owner.service';

@Component({
  selector: 'app-users-modal-info-owner',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './users-modal-info-owner.component.html',
  styleUrl: './users-modal-info-owner.component.css'
})
export class UsersModalInfoOwnerComponent implements OnInit{
  @Input() ownerModel: Owner = new Owner();
  infoOwner : FormGroup;
  filesOwner: FileDto[];
  plotsOwner : GetPlotDto[] = [];
  fullName : string = "";

  private readonly fileService = inject(FileService);
  private readonly ownerService = inject(OwnerService);

  ngOnInit(): void {
    this.infoOwner.patchValue({
      name: this.ownerModel.name,
      lastname: this.ownerModel.lastname,
      dni_type: this.ownerModel.dni_type,
      dni: this.ownerModel.dni,
      dno_type: this.ownerModel.dni_type,
      birthdate: this.formatDate(this.ownerModel.dateBirth),
      ownerType: this.ownerModel.ownerType,
      taxStatus: this.ownerModel.taxStatus,
      businessName: this.ownerModel.businessName
    });
    this.filesOwner =  this.ownerModel.files;
    this.infoOwner.disable();
    this.fullName = this.ownerModel.name + " " + this.ownerModel.lastname;

    this.ownerService.getByIdWithUser(this.ownerModel.id).subscribe({
      next: (data: any) => {     
        
        this.plotsOwner = data.plot;
        console.log(this.plotsOwner);
        
      }
    });

    
  }

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {

    this.infoOwner = this.fb.group({
      name: [''],
      lastname: [''],
      dni_type: [''],
      dni: [''],
      birthdate: [''],
      ownerType: [''],
      taxStatus: [''],
      businessName: [''],
      active: [''] 
    });

    this.filesOwner = [];
  }

  closeModal(){
    this.activeModal.close();
  }

  private formatDate(date: string): string {
    if (!date) return '';
    const [day, month, year] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  downloadFile(fileId: string) {
    this.fileService.downloadFile(fileId);
  }
}


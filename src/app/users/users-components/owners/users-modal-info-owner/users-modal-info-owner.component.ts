import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Owner } from '../../../users-models/owner/Owner';
import { FileService } from '../../../users-servicies/file.service';
import { FileDto } from '../../../users-models/owner/FileDto';
import { CommonModule } from '@angular/common';

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

  fullName : string = "";

  private readonly fileService = inject(FileService);

  ngOnInit(): void {
    this.infoOwner.patchValue({
      name: this.ownerModel.name,
      lastname: this.ownerModel.lastname,
      dni: this.ownerModel.dni,
      cuitCuil: this.ownerModel.cuitCuil,
      birthdate: this.ownerModel.dateBirth,
      ownerType: this.ownerModel.ownerType,
      taxStatus: this.ownerModel.taxStatus,
      businessName: this.ownerModel.businessName
    });
    this.filesOwner =  this.ownerModel.files;
    this.infoOwner.disable();
    this.fullName = this.ownerModel.name + " " + this.ownerModel.lastname;
  }

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {

    this.infoOwner = this.fb.group({
      name: [''],
      lastname: [''],
      dni: [''],
      cuitCuil: [''],
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

  downloadFile(fileId: string) {
    this.fileService.downloadFile(fileId);
  }
}


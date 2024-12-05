import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SanctionService } from '../../../../services/sanctions.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { SanctionsDTO } from '../../../../models/SanctionsDTO';

@Component({
  selector: 'app-penalties-modal-report',
  standalone: true,
  imports: [FormsModule,DatePipe, CommonModule],
  templateUrl: './penalties-get-report-modal.component.html',
  styleUrl: './penalties-get-report-modal.component.scss'
})
export class PenaltiesModalReportComponent implements OnInit{


  formattedDate:any;
  public service = inject(SanctionService)
  @Input() id:number = 0
  report: any;
  advetencias : SanctionsDTO[] = [];
  constructor(public activeModal: NgbActiveModal, private reportServices: SanctionService) {

  }
  ngOnInit(): void {
    this.getReport()
  }


  close(){
    this.activeModal.close()
  }

  
  //Busca el informe en especifico
  getReport(){
    this.service.getById(this.id)
    .subscribe(
      (respuesta) => {
        console.log(respuesta); 
        this.report = respuesta
        console.log(this.report)
        this.formattedDate = new Date(this.service.formatDate(this.report.createdDate))
      },
      (error) => {
        console.error('Error:', error);
      });
      
      this.reportServices.getAllSactions().subscribe(
        response => {
          this.advetencias = response.filter((a)=>a.reportId==this.id && a.fineState==null);
          console.log(response)
          console.log(this.advetencias)
        }, error => {
          alert(error)
        }
      )
  }
  

}

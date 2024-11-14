import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-penalties-kpi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './penalties-kpi.component.html',
  styleUrls: ['./penalties-kpi.component.css']
})
export class PenaltiesKpiComponent{

  constructor() { }

  @Input() amount : number =0
  @Input() amountundefined : number| undefined =0
  @Input() title : string =''
  @Input() subTitle: string=''
  @Input() tooltip: string=''
  @Input() customStyles: { [key: string]: string } = {};
  @Input() icon: string='';
  @Input() formatPipe: string='';

}

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-kpi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-kpi.component.html',
  styleUrls: ['./custom-kpi.component.css']
})
export class CustomKpiComponent{

  constructor() { }

  @Input() amount : number | null | undefined = 0;
  @Input() title : string ='';
  @Input() subTitle: string='';
  @Input() tooltip: string='';
  @Input() customStyles: { [key: string]: string } = {};
  @Input() icon: string='';
  @Input() formatPipe: string='';

}

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-iep-kpi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './iep-kpi.component.html',
  styleUrl: './iep-kpi.component.css'
})
export class IepKpiComponent {
  @Input() amount : number =0
  @Input() title : string =''
  @Input() subTitle: string=''
  @Input() tooltip: string=''
  @Input() customStyles: { [key: string]: string } = {};
  @Input() icon: string='';
  @Input() formatPipe: string='';
}

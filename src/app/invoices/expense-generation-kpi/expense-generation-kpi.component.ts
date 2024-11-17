import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expense-generation-kpi',
  standalone: true,
  imports: [CommonModule],
  providers:[{ provide: 'LOCALE_ID', useValue: 'es-AR' }],
  templateUrl: './expense-generation-kpi.component.html',
  styleUrl: './expense-generation-kpi.component.css'
})
export class ExpenseGenerationKpiComponent {

  @Input() amount : number =0
  @Input() title : string =''
  @Input() subTitle: string=''
  @Input() tooltip: string=''
  @Input() customStyles: { [key: string]: string } = {};
  @Input() icon: string='';
  @Input() formatPipe: string='';
}

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {  RouterModule } from '@angular/router';

@Component({
  selector: 'app-users-kpi',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './users-kpi.component.html',
  styleUrl: './users-kpi.component.css',
})
export class UsersKpiComponent {
  @Input() amount: number = 0;
  @Input() text: string = "";
  @Input() title: string = '';
  @Input() subTitle: string = '';
  @Input() tooltip: string = '';
  @Input() customStyles: { [key: string]: string } = {};
  @Input() icon: string = '';
  @Input() formatPipe: string = '';
  @Input() selectable: boolean = false;
  @Input() route: string | null = null;

}

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Provider } from '../../../../models/expenses-models/provider';
import { ProviderService } from '../../../../services/expenses-services/providerServices/provider.service';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-expense-provider-select',
  standalone: true,
  imports: [FormsModule],
  providers:[ProviderService],
  templateUrl: './expense-provider-select.component.html',
  styleUrl: './expense-provider-select.component.css'
})
export class ExpenseProviderSelectComponent implements OnInit, OnDestroy {
  constructor(private providerService: ProviderService){}

  providersList : Provider[] = [];
  @Input() selectedProviderId: number =0;
  @Output() selectedProviderIdChange = new EventEmitter<number>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    this.providerService.getProviders()
      .pipe(takeUntil(this.destroy$)) 
      .subscribe(
        (providers) => {
          this.providersList = providers;
        },
        (error) => {
          console.error('Error loading providers:', error);
        }
      );
  }


  onProviderChange(selectedValue: number): void {
    this.selectedProviderIdChange.emit(selectedValue);
  }

  ngOnDestroy(): void {
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }
}

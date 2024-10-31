import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseGenerationPaymentFormComponent } from './expense-generation-payment-form.component';

describe('ExpenseGenerationPaymentFormComponent', () => {
  let component: ExpenseGenerationPaymentFormComponent;
  let fixture: ComponentFixture<ExpenseGenerationPaymentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseGenerationPaymentFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseGenerationPaymentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

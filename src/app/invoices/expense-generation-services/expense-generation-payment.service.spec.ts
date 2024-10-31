import { TestBed } from '@angular/core/testing';

import { ExpenseGenerationPaymentService } from './expense-generation-payment.service';

describe('ExpenseGenerationPaymentService', () => {
  let service: ExpenseGenerationPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseGenerationPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ExpenseGenerationExpenseService } from './expense-generation-expense.service';

describe('ExpenseGenerationExpenseService', () => {
  let service: ExpenseGenerationExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseGenerationExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

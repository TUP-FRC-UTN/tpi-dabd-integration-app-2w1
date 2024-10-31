import { TestBed } from '@angular/core/testing';

import { ExpenseReportService } from './expense-report.service';

describe('ExpenseReportService', () => {
  let service: ExpenseReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

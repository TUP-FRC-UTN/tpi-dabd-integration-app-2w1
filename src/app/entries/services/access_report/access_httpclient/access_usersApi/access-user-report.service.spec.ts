import { TestBed } from '@angular/core/testing';

import { AccessUserReportService } from './access-user-report.service';

describe('AccessUserReportService', () => {
  let service: AccessUserReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessUserReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

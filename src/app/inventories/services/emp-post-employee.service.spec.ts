import { TestBed } from '@angular/core/testing';

import { EmpPostEmployeeService } from './emp-post-employee.service';

describe('EmpPostEmployeeService', () => {
  let service: EmpPostEmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpPostEmployeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

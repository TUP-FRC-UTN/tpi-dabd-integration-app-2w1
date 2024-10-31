import { TestBed } from '@angular/core/testing';

import { AccessVisitorsRegisterServiceService } from './access-visitors-register-service.service';

describe('AccessVisitorsRegisterServiceService', () => {
  let service: AccessVisitorsRegisterServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessVisitorsRegisterServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

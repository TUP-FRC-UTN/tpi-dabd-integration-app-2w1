import { TestBed } from '@angular/core/testing';

import { AccessVisitorsRegisterServiceHttpClientService } from './access-visitors-register-service-http-client.service';

describe('AccessVisitorsRegisterServiceHttpClientService', () => {
  let service: AccessVisitorsRegisterServiceHttpClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessVisitorsRegisterServiceHttpClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

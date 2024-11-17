import { TestBed } from '@angular/core/testing';

import { AccessVisitorsEditServiceHttpClientService } from './access-visitors-edit-service-http-client.service';

describe('AccessVisitorsEditServiceHttpClientService', () => {
  let service: AccessVisitorsEditServiceHttpClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessVisitorsEditServiceHttpClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

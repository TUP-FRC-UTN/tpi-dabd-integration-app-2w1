import { TestBed } from '@angular/core/testing';

import { AccessVisitorsEditServiceService } from './access-visitors-edit-service.service';

describe('AccessVisitorsEditServiceService', () => {
  let service: AccessVisitorsEditServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessVisitorsEditServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

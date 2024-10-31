import { TestBed } from '@angular/core/testing';

import { AccessVisitorHelperService } from './access-visitor-helper.service';

describe('AccessVisitorHelperService', () => {
  let service: AccessVisitorHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessVisitorHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

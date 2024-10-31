import { TestBed } from '@angular/core/testing';

import { AccessUserServiceService } from './access-user-service.service';

describe('UserServiceService', () => {
  let service: AccessUserServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessUserServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

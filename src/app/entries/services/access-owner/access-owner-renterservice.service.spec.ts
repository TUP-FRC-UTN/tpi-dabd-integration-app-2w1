import { TestBed } from '@angular/core/testing';

import { AccessOwnerRenterserviceService } from './access-owner-renterservice.service';

describe('AccessOwnerRenterserviceService', () => {
  let service: AccessOwnerRenterserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessOwnerRenterserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

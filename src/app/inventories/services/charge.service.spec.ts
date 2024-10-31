import { TestBed } from '@angular/core/testing';

import { ChargeService } from './charge.service';

describe('ChargeService', () => {
  let service: ChargeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChargeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

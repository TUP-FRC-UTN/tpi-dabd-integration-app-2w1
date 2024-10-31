import { TestBed } from '@angular/core/testing';

import { BillViewOwnerService } from './bill-view-owner.service';

describe('BillViewOwnerService', () => {
  let service: BillViewOwnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillViewOwnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

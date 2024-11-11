import { TestBed } from '@angular/core/testing';

import { WarehouseMovementService } from './warehouse-movement.service';

describe('WarehouseMovementService', () => {
  let service: WarehouseMovementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WarehouseMovementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

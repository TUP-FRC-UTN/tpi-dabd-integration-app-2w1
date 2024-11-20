import { TestBed } from '@angular/core/testing';

import { IncreaseDecrementService } from './increase-decrement.service';

describe('IncreaseDecrementService', () => {
  let service: IncreaseDecrementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncreaseDecrementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { PillowTimeLateArrivalService } from './pillow-time-late-arrival.service';

describe('PillowTimeLateArrivalService', () => {
  let service: PillowTimeLateArrivalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PillowTimeLateArrivalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

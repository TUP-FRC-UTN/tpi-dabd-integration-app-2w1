import { TestBed } from '@angular/core/testing';

import { AccessMetricsService } from './access-metrics.service';

describe('AccessMetricsService', () => {
  let service: AccessMetricsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessMetricsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

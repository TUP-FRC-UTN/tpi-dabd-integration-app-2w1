import { TestBed } from '@angular/core/testing';

import { VisitorsService } from './access-visitors.service';

describe('VisitorsService', () => {
  let service: VisitorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisitorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

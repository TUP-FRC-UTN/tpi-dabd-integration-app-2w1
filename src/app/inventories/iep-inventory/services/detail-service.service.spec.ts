import { TestBed } from '@angular/core/testing';

import { DetailServiceService } from './detail-service.service';

describe('DetailServiceService', () => {
  let service: DetailServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

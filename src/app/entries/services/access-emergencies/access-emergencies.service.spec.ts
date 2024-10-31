import { TestBed } from '@angular/core/testing';

import { AccessEmergenciesService } from './access-emergencies.service';

describe('AccessEmergenciesService', () => {
  let service: AccessEmergenciesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessEmergenciesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

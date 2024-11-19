import { TestBed } from '@angular/core/testing';

import { AccessInsurancesService } from '../../../src/app/entries/services/access-insurances.service';

describe('AccessInsurancesService', () => {
  let service: AccessInsurancesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessInsurancesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { AccessRegistryUpdateService } from './access-registry-update.service';

describe('AccessRegistryUpdateService', () => {
  let service: AccessRegistryUpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessRegistryUpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

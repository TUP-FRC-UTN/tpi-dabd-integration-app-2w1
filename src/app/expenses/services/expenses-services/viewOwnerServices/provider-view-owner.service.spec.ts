import { TestBed } from '@angular/core/testing';

import { ProviderViewOwnerService } from './provider-view-owner.service';

describe('ProviderViewOwnerService', () => {
  let service: ProviderViewOwnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProviderViewOwnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

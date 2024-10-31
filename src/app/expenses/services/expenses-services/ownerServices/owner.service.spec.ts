/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { OwnerService } from './owner.service';

describe('Service: Owner', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OwnerService]
    });
  });

  it('should ...', inject([OwnerService], (service: OwnerService) => {
    expect(service).toBeTruthy();
  }));
});

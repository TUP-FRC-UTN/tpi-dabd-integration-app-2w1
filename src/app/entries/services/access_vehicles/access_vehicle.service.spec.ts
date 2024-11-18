/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Access_vehicleService } from './access_vehicle.service';

describe('Service: Access_vehicle', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Access_vehicleService]
    });
  });

  it('should ...', inject([Access_vehicleService], (service: Access_vehicleService) => {
    expect(service).toBeTruthy();
  }));
});

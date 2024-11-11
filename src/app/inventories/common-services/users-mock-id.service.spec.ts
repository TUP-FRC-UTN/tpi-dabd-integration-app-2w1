import { TestBed } from '@angular/core/testing';

import { UsersMockIdService } from './users-mock-id.service';

describe('UsersMockIdService', () => {
  let service: UsersMockIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersMockIdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

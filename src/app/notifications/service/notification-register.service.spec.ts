import { TestBed } from '@angular/core/testing';

import { NotificationRegisterService } from './notification-register.service';

describe('NotificationRegisterService', () => {
  let service: NotificationRegisterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationRegisterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

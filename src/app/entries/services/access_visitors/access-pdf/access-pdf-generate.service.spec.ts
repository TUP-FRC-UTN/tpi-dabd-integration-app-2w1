import { TestBed } from '@angular/core/testing';

import { AccessPdfGenerateService } from './access-pdf-generate.service';

describe('AccessPdfGenerateService', () => {
  let service: AccessPdfGenerateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessPdfGenerateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

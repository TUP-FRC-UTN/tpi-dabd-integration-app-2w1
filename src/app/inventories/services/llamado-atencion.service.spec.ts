import { TestBed } from '@angular/core/testing';

import { LlamadoAtencionService } from './llamado-atencion.service';

describe('LlamadoAtencionService', () => {
  let service: LlamadoAtencionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LlamadoAtencionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

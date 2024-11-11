import { TestBed } from '@angular/core/testing';

import { ListadoDesempeñoService } from './listado-desempeño.service';

describe('ListadoDesempeñoService', () => {
  let service: ListadoDesempeñoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListadoDesempeñoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

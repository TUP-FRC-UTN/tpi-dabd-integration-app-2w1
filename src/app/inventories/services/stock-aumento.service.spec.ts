import { TestBed } from '@angular/core/testing';

import { StockAumentoService } from './stock-aumento.service';

describe('StockAumentoService', () => {
  let service: StockAumentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockAumentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

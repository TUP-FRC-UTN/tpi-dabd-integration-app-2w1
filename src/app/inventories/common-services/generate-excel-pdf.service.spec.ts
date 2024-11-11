import { TestBed } from '@angular/core/testing';

import { GenerateExcelPdfService } from '../iep-employees/services/generate-excel-pdf.service';

describe('GenerateExcelPdfService', () => {
  let service: GenerateExcelPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenerateExcelPdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

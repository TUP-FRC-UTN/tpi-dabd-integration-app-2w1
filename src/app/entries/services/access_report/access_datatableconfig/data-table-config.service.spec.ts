import { TestBed } from '@angular/core/testing';

import { DataTableConfigService } from './data-table-config.service';

describe('DataTableConfigService', () => {
  let service: DataTableConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataTableConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

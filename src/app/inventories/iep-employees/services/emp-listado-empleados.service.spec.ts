import { TestBed } from '@angular/core/testing';

import { EmpListadoEmpleadosService } from './emp-listado-empleados.service';

describe('EmpListadoEmpleadosService', () => {
  let service: EmpListadoEmpleadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpListadoEmpleadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

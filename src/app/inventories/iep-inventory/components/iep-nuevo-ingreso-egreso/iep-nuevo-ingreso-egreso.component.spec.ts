import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepNuevoIngresoEgresoComponent } from './iep-nuevo-ingreso-egreso.component';

describe('IepNuevoIngresoEgresoComponent', () => {
  let component: IepNuevoIngresoEgresoComponent;
  let fixture: ComponentFixture<IepNuevoIngresoEgresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepNuevoIngresoEgresoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepNuevoIngresoEgresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

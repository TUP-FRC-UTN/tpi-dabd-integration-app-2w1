import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepChartsEmployeesComponent } from './iep-charts-employees.component';

describe('IepChartsEmployeesComponent', () => {
  let component: IepChartsEmployeesComponent;
  let fixture: ComponentFixture<IepChartsEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepChartsEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepChartsEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

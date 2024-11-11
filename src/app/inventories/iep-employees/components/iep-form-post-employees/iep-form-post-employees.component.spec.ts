import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IEPFormPostEmployeesComponent } from './iep-form-post-employees.component';

describe('IEPFormPostEmployeesComponent', () => {
  let component: IEPFormPostEmployeesComponent;
  let fixture: ComponentFixture<IEPFormPostEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IEPFormPostEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IEPFormPostEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

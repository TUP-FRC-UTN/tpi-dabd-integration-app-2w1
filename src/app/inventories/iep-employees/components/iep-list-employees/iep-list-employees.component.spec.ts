import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepListEmployeesComponent } from './iep-list-employees.component';

describe('IepListEmployeesComponent', () => {
  let component: IepListEmployeesComponent;
  let fixture: ComponentFixture<IepListEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepListEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepListEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepPutEmployeesComponent } from './iep-put-employees.component';

describe('IepPutEmployeesComponent', () => {
  let component: IepPutEmployeesComponent;
  let fixture: ComponentFixture<IepPutEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepPutEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepPutEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

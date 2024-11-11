import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepAttendancesComponent } from './iep-attendances.component';

describe('IepAttendancesComponent', () => {
  let component: IepAttendancesComponent;
  let fixture: ComponentFixture<IepAttendancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepAttendancesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepAttendancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

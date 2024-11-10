import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepAttendancesNgselectComponent } from './iep-attendances-ngselect.component';

describe('IepAttendancesNgselectComponent', () => {
  let component: IepAttendancesNgselectComponent;
  let fixture: ComponentFixture<IepAttendancesNgselectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepAttendancesNgselectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepAttendancesNgselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

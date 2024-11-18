import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessTimeRangeVisitorsRegistrationComponent } from './access-time-range-visitors-registration.component';

describe('AccessTimeRangeVisitorsRegistrationComponent', () => {
  let component: AccessTimeRangeVisitorsRegistrationComponent;
  let fixture: ComponentFixture<AccessTimeRangeVisitorsRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessTimeRangeVisitorsRegistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessTimeRangeVisitorsRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

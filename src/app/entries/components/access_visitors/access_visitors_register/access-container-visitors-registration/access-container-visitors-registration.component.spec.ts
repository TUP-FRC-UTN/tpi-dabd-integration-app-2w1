import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessContainerVisitorsRegistrationComponent } from './access-container-visitors-registration.component';

describe('AccessContainerVisitorsRegistrationComponent', () => {
  let component: AccessContainerVisitorsRegistrationComponent;
  let fixture: ComponentFixture<AccessContainerVisitorsRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessContainerVisitorsRegistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessContainerVisitorsRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

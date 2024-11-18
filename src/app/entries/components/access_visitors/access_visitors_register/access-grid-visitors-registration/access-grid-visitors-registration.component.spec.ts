import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessGridVisitorsRegistrationComponent } from './access-grid-visitors-registration.component';

describe('AccessGridVisitorsRegistrationComponent', () => {
  let component: AccessGridVisitorsRegistrationComponent;
  let fixture: ComponentFixture<AccessGridVisitorsRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessGridVisitorsRegistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessGridVisitorsRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

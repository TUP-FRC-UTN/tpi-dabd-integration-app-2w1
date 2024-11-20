import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessRegisterVisitorsComponent } from './access-register-visitors.component';

describe('AccessRegisterVisitorsComponent', () => {
  let component: AccessRegisterVisitorsComponent;
  let fixture: ComponentFixture<AccessRegisterVisitorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessRegisterVisitorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessRegisterVisitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessGeneralDashboardComponent } from './access-general-dashboard.component';

describe('AccessGeneralDashboardComponent', () => {
  let component: AccessGeneralDashboardComponent;
  let fixture: ComponentFixture<AccessGeneralDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessGeneralDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessGeneralDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

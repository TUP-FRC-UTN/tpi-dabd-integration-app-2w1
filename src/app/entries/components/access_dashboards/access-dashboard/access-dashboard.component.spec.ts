import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessDashboardComponent } from './access-dashboard.component';

describe('AccessDashboardComponent', () => {
  let component: AccessDashboardComponent;
  let fixture: ComponentFixture<AccessDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

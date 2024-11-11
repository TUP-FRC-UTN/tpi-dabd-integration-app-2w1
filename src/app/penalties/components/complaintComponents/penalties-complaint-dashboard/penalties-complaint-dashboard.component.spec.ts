import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltiesComplaintDashboardComponent } from './penalties-complaint-dashboard.component';

describe('PenaltiesComplaintDashboardComponent', () => {
  let component: PenaltiesComplaintDashboardComponent;
  let fixture: ComponentFixture<PenaltiesComplaintDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenaltiesComplaintDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenaltiesComplaintDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

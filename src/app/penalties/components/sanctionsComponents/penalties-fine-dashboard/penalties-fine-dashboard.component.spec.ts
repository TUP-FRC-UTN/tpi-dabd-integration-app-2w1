import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltiesFineDashboardComponent } from './penalties-fine-dashboard.component';

describe('PenaltiesFineDashboardComponent', () => {
  let component: PenaltiesFineDashboardComponent;
  let fixture: ComponentFixture<PenaltiesFineDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenaltiesFineDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenaltiesFineDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

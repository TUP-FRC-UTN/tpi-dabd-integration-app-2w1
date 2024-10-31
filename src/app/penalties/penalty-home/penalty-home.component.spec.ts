import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltyHomeComponent } from './penalty-home.component';

describe('PenaltyHomeComponent', () => {
  let component: PenaltyHomeComponent;
  let fixture: ComponentFixture<PenaltyHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenaltyHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenaltyHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

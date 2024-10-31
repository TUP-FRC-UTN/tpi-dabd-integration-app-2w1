import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltiesUpdateStateReasonModalComponent } from './penalties-update-state-reason-modal.component';

describe('PenaltiesUpdateStateReasonModalComponent', () => {
  let component: PenaltiesUpdateStateReasonModalComponent;
  let fixture: ComponentFixture<PenaltiesUpdateStateReasonModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenaltiesUpdateStateReasonModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenaltiesUpdateStateReasonModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

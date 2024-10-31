import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltiesModalStateReasonComponent } from './penalties-update-stateReason-modal.component';

describe('PenaltiesModalStateReasonComponent', () => {
  let component: PenaltiesModalStateReasonComponent;
  let fixture: ComponentFixture<PenaltiesModalStateReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenaltiesModalStateReasonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenaltiesModalStateReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

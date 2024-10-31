import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltiesModalFineComponent } from './penalties-get-fine-modal.component';

describe('PenaltiesModalFineComponent', () => {
  let component: PenaltiesModalFineComponent;
  let fixture: ComponentFixture<PenaltiesModalFineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenaltiesModalFineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenaltiesModalFineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

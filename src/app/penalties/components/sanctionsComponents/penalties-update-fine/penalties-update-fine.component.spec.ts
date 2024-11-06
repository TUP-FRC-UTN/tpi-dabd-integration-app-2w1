import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltiesUpdateFineComponent } from './penalties-update-fine.component';

describe('PenaltiesUpdateFineComponent', () => {
  let component: PenaltiesUpdateFineComponent;
  let fixture: ComponentFixture<PenaltiesUpdateFineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenaltiesUpdateFineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenaltiesUpdateFineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

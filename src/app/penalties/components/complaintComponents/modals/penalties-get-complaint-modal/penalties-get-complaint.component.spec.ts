import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltiesModalConsultComplaintComponent } from './penalties-get-complaint.component';

describe('PenaltiesModalConsultComplaintComponent', () => {
  let component: PenaltiesModalConsultComplaintComponent;
  let fixture: ComponentFixture<PenaltiesModalConsultComplaintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenaltiesModalConsultComplaintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenaltiesModalConsultComplaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

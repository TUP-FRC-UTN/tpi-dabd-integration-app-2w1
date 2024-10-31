import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltiesPostComplaintComponent } from './penalties-post-complaint.component';

describe('PenaltiesPostComplaintComponent', () => {
  let component: PenaltiesPostComplaintComponent;
  let fixture: ComponentFixture<PenaltiesPostComplaintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenaltiesPostComplaintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenaltiesPostComplaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltiesListComplaintComponent } from './penalties-list-complaints.component';

describe('PenaltiesListComplaintComponent', () => {
  let component: PenaltiesListComplaintComponent;
  let fixture: ComponentFixture<PenaltiesListComplaintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenaltiesListComplaintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenaltiesListComplaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

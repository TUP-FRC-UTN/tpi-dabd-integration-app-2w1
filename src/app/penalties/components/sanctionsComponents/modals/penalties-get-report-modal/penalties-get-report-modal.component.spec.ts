import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltiesModalReportComponent } from './penalties-get-report-modal.component';

describe('PenaltiesModalReportComponent', () => {
  let component: PenaltiesModalReportComponent;
  let fixture: ComponentFixture<PenaltiesModalReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenaltiesModalReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenaltiesModalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

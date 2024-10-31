import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessReportHoodComponent } from './access-report-hood.component';

describe('ReportHoodComponent', () => {
  let component: AccessReportHoodComponent;
  let fixture: ComponentFixture<AccessReportHoodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessReportHoodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessReportHoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

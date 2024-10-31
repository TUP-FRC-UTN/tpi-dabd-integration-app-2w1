import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportModifyComponent } from './sanctions-update-report.component';

describe('ReportModifyComponent', () => {
  let component: ReportModifyComponent;
  let fixture: ComponentFixture<ReportModifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportModifyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportModifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

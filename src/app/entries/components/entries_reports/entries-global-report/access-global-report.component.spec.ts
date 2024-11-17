import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessGlobalReportComponent } from './access-global-report.component';

describe('AccessGlobalReportComponent', () => {
  let component: AccessGlobalReportComponent;
  let fixture: ComponentFixture<AccessGlobalReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessGlobalReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessGlobalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

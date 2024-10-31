import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewReportComponent } from './penalties-post-report.component';

describe('NewReportComponent', () => {
  let component: NewReportComponent;
  let fixture: ComponentFixture<NewReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

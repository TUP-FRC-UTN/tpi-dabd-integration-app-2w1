import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersReportComponent } from './users-report.component';

describe('UsersReportComponent', () => {
  let component: UsersReportComponent;
  let fixture: ComponentFixture<UsersReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

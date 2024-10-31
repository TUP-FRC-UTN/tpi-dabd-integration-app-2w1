import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportExpenseComponent } from './report-expense.component';

describe('ReportExpenseComponent', () => {
  let component: ReportExpenseComponent;
  let fixture: ComponentFixture<ReportExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportExpenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

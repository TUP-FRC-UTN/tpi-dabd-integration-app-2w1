import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseGenerationKpiComponent } from './expense-generation-kpi.component';

describe('ExpenseGenerationKpiComponent', () => {
  let component: ExpenseGenerationKpiComponent;
  let fixture: ComponentFixture<ExpenseGenerationKpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseGenerationKpiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseGenerationKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

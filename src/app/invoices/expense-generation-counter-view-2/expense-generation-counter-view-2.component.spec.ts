import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseGenerationCounterView2Component } from './expense-generation-counter-view-2.component';

describe('ExpenseGenerationCounterView2Component', () => {
  let component: ExpenseGenerationCounterView2Component;
  let fixture: ComponentFixture<ExpenseGenerationCounterView2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseGenerationCounterView2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseGenerationCounterView2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseViewComponent } from './expense-view.component';

describe('ExpenseViewComponent', () => {
  let component: ExpenseViewComponent;
  let fixture: ComponentFixture<ExpenseViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

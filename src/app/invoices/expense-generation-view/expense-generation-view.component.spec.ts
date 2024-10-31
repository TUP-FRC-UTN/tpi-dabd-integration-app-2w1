import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseGenerationViewComponent } from './expense-generation-view.component';

describe('ExpenseGenerationViewComponent', () => {
  let component: ExpenseGenerationViewComponent;
  let fixture: ComponentFixture<ExpenseGenerationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseGenerationViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseGenerationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseGenerationCardComponent } from './expense-generation-card.component';

describe('ExpenseGenerationCardComponent', () => {
  let component: ExpenseGenerationCardComponent;
  let fixture: ComponentFixture<ExpenseGenerationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseGenerationCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseGenerationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

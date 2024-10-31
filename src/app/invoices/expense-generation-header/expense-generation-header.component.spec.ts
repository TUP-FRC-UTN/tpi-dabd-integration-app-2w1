import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseGenerationHeaderComponent } from './expense-generation-header.component';

describe('ExpenseGenerationHeaderComponent', () => {
  let component: ExpenseGenerationHeaderComponent;
  let fixture: ComponentFixture<ExpenseGenerationHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseGenerationHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseGenerationHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

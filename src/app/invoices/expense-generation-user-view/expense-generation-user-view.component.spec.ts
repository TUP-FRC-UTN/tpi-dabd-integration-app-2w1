import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseGenerationUserViewComponent } from './expense-generation-user-view.component';

describe('ExpenseGenerationUserViewComponent', () => {
  let component: ExpenseGenerationUserViewComponent;
  let fixture: ComponentFixture<ExpenseGenerationUserViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseGenerationUserViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseGenerationUserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

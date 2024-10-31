import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesEditCategoryComponent } from './expenses-edit-category.component';

describe('ExpensesEditCategoryComponent', () => {
  let component: ExpensesEditCategoryComponent;
  let fixture: ComponentFixture<ExpensesEditCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesEditCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesEditCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

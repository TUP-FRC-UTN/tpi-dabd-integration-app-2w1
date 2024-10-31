import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesViewCategoryComponent } from './expenses-view-category.component';

describe('ExpensesViewCategoryComponent', () => {
  let component: ExpensesViewCategoryComponent;
  let fixture: ComponentFixture<ExpensesViewCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesViewCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesViewCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

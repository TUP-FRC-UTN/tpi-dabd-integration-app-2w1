import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseRegisterCategoryComponent } from './expense-register-category.component';

describe('ExpenseRegisterCategoryComponent', () => {
  let component: ExpenseRegisterCategoryComponent;
  let fixture: ComponentFixture<ExpenseRegisterCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseRegisterCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseRegisterCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

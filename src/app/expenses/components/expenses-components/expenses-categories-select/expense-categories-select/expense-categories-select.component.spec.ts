import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCategoriesSelectComponent } from './expense-categories-select.component';

describe('ExpenseCategoriesSelectComponent', () => {
  let component: ExpenseCategoriesSelectComponent;
  let fixture: ComponentFixture<ExpenseCategoriesSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseCategoriesSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseCategoriesSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

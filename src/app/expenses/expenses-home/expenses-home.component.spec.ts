import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesHomeComponent } from './expenses-home.component';

describe('ExpensesHomeComponent', () => {
  let component: ExpensesHomeComponent;
  let fixture: ComponentFixture<ExpensesHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

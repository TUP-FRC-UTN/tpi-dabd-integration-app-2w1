import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesNavbarComponent } from './expenses-navbar.component';

describe('ExpensesNavbarComponent', () => {
  let component: ExpensesNavbarComponent;
  let fixture: ComponentFixture<ExpensesNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

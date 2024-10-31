import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesSideButtonComponent } from './expenses-side-button.component';

describe('ExpensesSideButtonComponent', () => {
  let component: ExpensesSideButtonComponent;
  let fixture: ComponentFixture<ExpensesSideButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesSideButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesSideButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseGenerationUserSideButtonComponent } from './expense-generation-user-side-button.component';

describe('ExpenseGenerationUserSideButtonComponent', () => {
  let component: ExpenseGenerationUserSideButtonComponent;
  let fixture: ComponentFixture<ExpenseGenerationUserSideButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseGenerationUserSideButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseGenerationUserSideButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

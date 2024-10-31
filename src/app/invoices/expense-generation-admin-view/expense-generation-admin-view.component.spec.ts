import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseGenerationAdminViewComponent } from './expense-generation-admin-view.component';

describe('ExpenseGenerationAdminViewComponent', () => {
  let component: ExpenseGenerationAdminViewComponent;
  let fixture: ComponentFixture<ExpenseGenerationAdminViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseGenerationAdminViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseGenerationAdminViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

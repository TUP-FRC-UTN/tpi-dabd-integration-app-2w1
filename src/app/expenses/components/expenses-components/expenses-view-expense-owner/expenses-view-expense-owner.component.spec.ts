import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOwnerExpenseComponent } from './expenses-view-expense-owner.component';

describe('ViewOwnerExpenseComponent', () => {
  let component: ViewOwnerExpenseComponent;
  let fixture: ComponentFixture<ViewOwnerExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewOwnerExpenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewOwnerExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesOwnersNgSelectComponent } from './expenses-owners-ng-select.component';

describe('ExpensesOwnersNgSelectComponent', () => {
  let component: ExpensesOwnersNgSelectComponent;
  let fixture: ComponentFixture<ExpensesOwnersNgSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesOwnersNgSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesOwnersNgSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

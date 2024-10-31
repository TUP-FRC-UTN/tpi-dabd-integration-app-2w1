import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseProviderSelectComponent } from './expense-provider-select.component';

describe('ExpenseProviderSelectComponent', () => {
  let component: ExpenseProviderSelectComponent;
  let fixture: ComponentFixture<ExpenseProviderSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseProviderSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseProviderSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

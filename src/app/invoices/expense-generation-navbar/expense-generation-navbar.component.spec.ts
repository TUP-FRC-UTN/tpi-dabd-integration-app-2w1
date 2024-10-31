import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseGenerationNavbarComponent } from './expense-generation-navbar.component';

describe('ExpenseGenerationNavbarComponent', () => {
  let component: ExpenseGenerationNavbarComponent;
  let fixture: ComponentFixture<ExpenseGenerationNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseGenerationNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseGenerationNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

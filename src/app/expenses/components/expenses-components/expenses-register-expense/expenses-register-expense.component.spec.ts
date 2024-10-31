/* tslint:disable:no-unused-variable */
import {  ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ExpensesRegisterExpenseComponent } from './expenses-register-expense.component';

describe('ExpensesRegisterExpenseComponent', () => {
  let component: ExpensesRegisterExpenseComponent;
  let fixture: ComponentFixture<ExpensesRegisterExpenseComponent>;

  

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesRegisterExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

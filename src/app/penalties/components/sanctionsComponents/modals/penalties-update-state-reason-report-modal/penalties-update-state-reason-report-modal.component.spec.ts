/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PenaltiesUpdateStateReasonReportModalComponent } from './penalties-update-state-reason-report-modal.component';

describe('PenaltiesUpdateStateReasonReportModalComponent', () => {
  let component: PenaltiesUpdateStateReasonReportModalComponent;
  let fixture: ComponentFixture<PenaltiesUpdateStateReasonReportModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PenaltiesUpdateStateReasonReportModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PenaltiesUpdateStateReasonReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

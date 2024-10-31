import { ComponentFixture, TestBed } from '@angular/core/testing';

import {IepDetailTableComponent } from './iep-detail-table.component';

describe('iepDetailTableComponent', () => {
  let component: IepDetailTableComponent;
  let fixture: ComponentFixture<IepDetailTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepDetailTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepDetailTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

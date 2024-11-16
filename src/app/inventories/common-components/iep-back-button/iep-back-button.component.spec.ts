import { ComponentFixture, TestBed } from '@angular/core/testing';

import { iepBackButtonComponent } from './iep-back-button.component';

describe('iepBackButtonComponent', () => {
  let component: iepBackButtonComponent;
  let fixture: ComponentFixture<iepBackButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [iepBackButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(iepBackButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

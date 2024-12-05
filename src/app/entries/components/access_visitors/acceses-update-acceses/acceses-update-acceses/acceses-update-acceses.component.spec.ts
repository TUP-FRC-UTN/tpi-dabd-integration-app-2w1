import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesesUpdateAccesesComponent } from './acceses-update-acceses.component';

describe('AccesesUpdateAccesesComponent', () => {
  let component: AccesesUpdateAccesesComponent;
  let fixture: ComponentFixture<AccesesUpdateAccesesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesesUpdateAccesesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesesUpdateAccesesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

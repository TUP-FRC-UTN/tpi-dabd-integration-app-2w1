import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepChargesComponent } from './iep-charges.component';

describe('IepChargesComponent', () => {
  let component: IepChargesComponent;
  let fixture: ComponentFixture<IepChargesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepChargesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

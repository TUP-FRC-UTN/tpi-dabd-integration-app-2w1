import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepChartsInventoryComponent } from './iep-charts-inventory.component';

describe('IepChartsInventoryComponent', () => {
  let component: IepChartsInventoryComponent;
  let fixture: ComponentFixture<IepChartsInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepChartsInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepChartsInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

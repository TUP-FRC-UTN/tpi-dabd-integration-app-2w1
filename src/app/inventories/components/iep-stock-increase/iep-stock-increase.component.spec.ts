import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepStockIncreaseComponent } from './iep-stock-increase.component';

describe('IepStockIncreaseComponent', () => {
  let component: IepStockIncreaseComponent;
  let fixture: ComponentFixture<IepStockIncreaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepStockIncreaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepStockIncreaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

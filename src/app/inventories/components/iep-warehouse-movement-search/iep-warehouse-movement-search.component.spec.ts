import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepWarehouseMovementSearchComponent } from './iep-warehouse-movement-search.component';

describe('IepWarehouseMovementSearchComponent', () => {
  let component: IepWarehouseMovementSearchComponent;
  let fixture: ComponentFixture<IepWarehouseMovementSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepWarehouseMovementSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepWarehouseMovementSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

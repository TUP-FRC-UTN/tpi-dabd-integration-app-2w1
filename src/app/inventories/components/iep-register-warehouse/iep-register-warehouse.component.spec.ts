import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepRegisterWarehouseComponent } from './iep-register-warehouse.component';

describe('IepRegisterWarehouseComponent', () => {
  let component: IepRegisterWarehouseComponent;
  let fixture: ComponentFixture<IepRegisterWarehouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepRegisterWarehouseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepRegisterWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

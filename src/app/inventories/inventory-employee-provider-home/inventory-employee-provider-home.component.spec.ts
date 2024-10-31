import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryEmployeeProviderHomeComponent } from './inventory-employee-provider-home.component';

describe('InventoryEmployeeProviderHomeComponent', () => {
  let component: InventoryEmployeeProviderHomeComponent;
  let fixture: ComponentFixture<InventoryEmployeeProviderHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryEmployeeProviderHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryEmployeeProviderHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

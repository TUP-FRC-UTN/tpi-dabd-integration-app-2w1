import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepInventoryComponent } from './iep-inventory.component';

describe('IepInventoryComponent', () => {
  let component: IepInventoryComponent;
  let fixture: ComponentFixture<IepInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

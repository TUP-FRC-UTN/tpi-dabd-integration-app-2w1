import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepSupplierUpdateComponent } from './iep-supplier-update.component';

describe('IepSupplierUpdateComponent', () => {
  let component: IepSupplierUpdateComponent;
  let fixture: ComponentFixture<IepSupplierUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepSupplierUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepSupplierUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

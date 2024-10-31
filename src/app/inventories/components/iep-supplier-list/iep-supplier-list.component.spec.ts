import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepSupplierListComponent } from './iep-supplier-list.component';

describe('IepSupplierListComponent', () => {
  let component: IepSupplierListComponent;
  let fixture: ComponentFixture<IepSupplierListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepSupplierListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepSupplierListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

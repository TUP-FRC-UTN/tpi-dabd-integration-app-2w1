import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepProductComponent } from './iep-product.component';

describe('IepProductComponent', () => {
  let component: IepProductComponent;
  let fixture: ComponentFixture<IepProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepFilterComponent } from './iep-filter.component';

describe('IepFilterComponent', () => {
  let component: IepFilterComponent;
  let fixture: ComponentFixture<IepFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

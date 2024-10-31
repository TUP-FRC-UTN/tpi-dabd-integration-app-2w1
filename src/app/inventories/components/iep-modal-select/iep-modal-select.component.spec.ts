import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepModalSelectComponent } from './iep-modal-select.component';

describe('IepModalSelectComponent', () => {
  let component: IepModalSelectComponent;
  let fixture: ComponentFixture<IepModalSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepModalSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepModalSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

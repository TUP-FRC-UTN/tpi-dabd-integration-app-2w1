import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessFilterComponent } from './access-filter.component';

describe('AccessFilterComponent', () => {
  let component: AccessFilterComponent;
  let fixture: ComponentFixture<AccessFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

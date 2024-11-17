import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessVehiclesViewComponent } from './access-vehicles-view.component';

describe('AccessVehiclesViewComponent', () => {
  let component: AccessVehiclesViewComponent;
  let fixture: ComponentFixture<AccessVehiclesViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessVehiclesViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessVehiclesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

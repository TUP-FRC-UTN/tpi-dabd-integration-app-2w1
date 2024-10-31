import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessRegisterEmergencyComponent } from './access-register-emergency.component';

describe('AccessRegisterEmergencyComponent', () => {
  let component: AccessRegisterEmergencyComponent;
  let fixture: ComponentFixture<AccessRegisterEmergencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessRegisterEmergencyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessRegisterEmergencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

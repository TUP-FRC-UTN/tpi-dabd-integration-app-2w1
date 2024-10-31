import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarNotificationComponent } from './navbar-notification.component';

describe('NavbarNotificationComponent', () => {
  let component: NavbarNotificationComponent;
  let fixture: ComponentFixture<NavbarNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarNotificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NavbarNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

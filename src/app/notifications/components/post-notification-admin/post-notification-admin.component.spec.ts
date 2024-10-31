import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostNotificationAdminComponent } from './post-notification-admin.component';

describe('PostNotificationAdminComponent', () => {
  let component: PostNotificationAdminComponent;
  let fixture: ComponentFixture<PostNotificationAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostNotificationAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PostNotificationAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

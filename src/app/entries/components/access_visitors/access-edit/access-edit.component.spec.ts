import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessEditComponent } from './access-edit.component';

describe('AccessEditComponent', () => {
  let component: AccessEditComponent;
  let fixture: ComponentFixture<AccessEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

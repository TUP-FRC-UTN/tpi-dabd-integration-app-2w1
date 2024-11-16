import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersGraphicBlocksComponent } from './users-graphic-blocks.component';

describe('UsersGraphicBlocksComponent', () => {
  let component: UsersGraphicBlocksComponent;
  let fixture: ComponentFixture<UsersGraphicBlocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersGraphicBlocksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersGraphicBlocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

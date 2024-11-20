import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepPillowLaterArrivalConfigComponent } from './iep-pillow-later-arrival-config.component';

describe('IepPillowLaterArrivalConfigComponent', () => {
  let component: IepPillowLaterArrivalConfigComponent;
  let fixture: ComponentFixture<IepPillowLaterArrivalConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepPillowLaterArrivalConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepPillowLaterArrivalConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepAttentionCallComponent } from './iep-attention-call.component';

describe('iepAttentionCallComponent', () => {
  let component: IepAttentionCallComponent;
  let fixture: ComponentFixture<IepAttentionCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepAttentionCallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepAttentionCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

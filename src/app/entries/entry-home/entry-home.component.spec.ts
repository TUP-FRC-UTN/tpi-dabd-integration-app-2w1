import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryHomeComponent } from './entry-home.component';

describe('EntryHomeComponent', () => {
  let component: EntryHomeComponent;
  let fixture: ComponentFixture<EntryHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntryHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntryHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

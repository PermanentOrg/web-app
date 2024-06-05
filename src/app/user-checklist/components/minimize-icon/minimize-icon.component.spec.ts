/* @format */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinimizeIconComponent } from './minimize-icon.component';

describe('MinimizeIconComponent', () => {
  let component: MinimizeIconComponent;
  let fixture: ComponentFixture<MinimizeIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MinimizeIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MinimizeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

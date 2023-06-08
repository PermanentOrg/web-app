/* @format */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegacyContactDialogComponent } from './legacy-contact-dialog.component';

describe('LegacyContactDialogComponent', () => {
  let component: LegacyContactDialogComponent;
  let fixture: ComponentFixture<LegacyContactDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LegacyContactDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LegacyContactDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

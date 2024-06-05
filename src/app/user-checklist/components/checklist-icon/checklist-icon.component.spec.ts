/* @format */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistIconComponent } from './checklist-icon.component';

describe('ChecklistIconComponent', () => {
  let component: ChecklistIconComponent;
  let fixture: ComponentFixture<ChecklistIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChecklistIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

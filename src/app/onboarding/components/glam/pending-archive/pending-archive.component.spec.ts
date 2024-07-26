/* @format */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingArchiveComponent } from './pending-archive.component';

describe('PendingArchiveComponent', () => {
  let component: PendingArchiveComponent;
  let fixture: ComponentFixture<PendingArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingArchiveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PendingArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

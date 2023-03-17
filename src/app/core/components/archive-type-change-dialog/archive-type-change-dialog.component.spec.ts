import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveTypeChangeDialogComponent } from './archive-type-change-dialog.component';

describe('ArchiveTypeChangeDialogComponent', () => {
  let component: ArchiveTypeChangeDialogComponent;
  let fixture: ComponentFixture<ArchiveTypeChangeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchiveTypeChangeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveTypeChangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveSwitcherDialogComponent } from './archive-switcher-dialog.component';

describe('ArchiveSwitcherDialogComponent', () => {
  let component: ArchiveSwitcherDialogComponent;
  let fixture: ComponentFixture<ArchiveSwitcherDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchiveSwitcherDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveSwitcherDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

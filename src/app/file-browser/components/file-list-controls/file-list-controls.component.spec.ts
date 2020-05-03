import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileListControlsComponent } from './file-list-controls.component';

describe('FileListControlsComponent', () => {
  let component: FileListControlsComponent;
  let fixture: ComponentFixture<FileListControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileListControlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileListControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

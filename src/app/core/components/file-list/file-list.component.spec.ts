import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileListComponent } from '@core/components/file-list/file-list.component';

xxdescribe('FileListComponent', () => {
  let component: FileListComponent;
  let fixture: ComponentFixture<FileListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

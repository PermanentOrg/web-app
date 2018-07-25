import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileListItemComponent } from '@core/components/file-list-item/file-list-item.component';

xdescribe('FileListItemComponent', () => {
  let component: FileListItemComponent;
  let fixture: ComponentFixture<FileListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

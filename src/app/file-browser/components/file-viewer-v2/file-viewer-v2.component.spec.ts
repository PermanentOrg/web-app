import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileViewerV2Component } from './file-viewer-v2.component';

describe('FileViewerV2Component', () => {
  let component: FileViewerV2Component;
  let fixture: ComponentFixture<FileViewerV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileViewerV2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FileViewerV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

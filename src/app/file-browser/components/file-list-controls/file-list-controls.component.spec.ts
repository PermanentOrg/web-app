import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileListControlsComponent } from './file-list-controls.component';
import { BASE_TEST_CONFIG } from '@root/test/testbedConfig';

describe('FileListControlsComponent', () => {
  let component: FileListControlsComponent;
  let fixture: ComponentFixture<FileListControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ BASE_TEST_CONFIG.imports ],
      declarations: [ FileListControlsComponent ],
      providers: [ BASE_TEST_CONFIG.providers ]
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

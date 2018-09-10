import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';

import { UploadButtonComponent } from './upload-button.component';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@root/app/models';

fdescribe('UploadButtonComponent', () => {
  let component: UploadButtonComponent;
  let fixture: ComponentFixture<UploadButtonComponent>;

  let dataService: DataService;

  beforeEach(async(() => {
    const config = Testing.BASE_TEST_CONFIG;
    config.declarations.push(UploadButtonComponent);
    const providers = config.providers as any[];
    providers.push(DataService);
    TestBed.configureTestingModule(config).compileComponents();
  }));

  beforeEach(() => {
    dataService = TestBed.get(DataService);

    fixture = TestBed.createComponent(UploadButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden when no current folder set', () => {
    const button = fixture.debugElement.nativeElement.querySelector('.btn');
    expect(button.hidden).toBeTruthy();
  });

  it('should be visible when current folder is not an apps folder', () => {
    dataService.setCurrentFolder(new FolderVO({
      type: 'type.folder.private'
    }));
    fixture.whenRenderingDone().then(() => {
      const button = fixture.debugElement.nativeElement.querySelector('.btn');
      setTimeout(() => {
        expect(component.hidden).toBeFalsy();
        // expect(button.hidden).toBeFalsy();
      });
    });
  });

  it('should be hidden when current folder is an apps folder', () => {
    dataService.setCurrentFolder(new FolderVO({
      type: 'type.folder.app'
    }));
    fixture.whenRenderingDone().then(() => {
      const button = fixture.debugElement.nativeElement.querySelector('.btn');
      setTimeout(() => {
        expect(component.hidden).toBeTruthy();
        // expect(button.hidden).toBeTruthy();
      });
    });
  });
});

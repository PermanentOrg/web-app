/* @format */
import { UploadService } from '@core/services/upload/upload.service';
import { CoreModule } from '@core/core.module';
import { EventEmitter } from '@angular/core';
import { Shallow } from 'shallow-render';
import {
  UploadProgressEvent,
  UploadSessionStatus,
} from '@core/services/upload/upload.session';
import { UploadItem } from '@core/services/upload/uploadItem';
import { FolderVO } from '@models/index';
import { UploadProgressComponent } from './upload-progress.component';

class MockUploadSession {
  public progress = new EventEmitter<UploadProgressEvent>();
}

const mockUploadService = {
  registerComponent: () => {},
  uploadSession: new MockUploadSession(),
  getTargetFolderId: () => {
    return 10;
  },
  getTargetFolderName: () => {
    return 'testfolder';
  },
};

describe('UploadProgressComponent', () => {
  let shallow: Shallow<UploadProgressComponent>;

  beforeEach(() => {
    shallow = new Shallow(UploadProgressComponent, CoreModule).mock(
      UploadService,
      mockUploadService,
    );
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should become visible when show() is called', async () => {
    const { instance } = await shallow.render();
    instance.show();

    expect(instance.visible).toBe(true);
  });

  it('should display the correct file name and the folder when dragging the file into a folder', async () => {
    const { find, instance, fixture } = await shallow.render();

    const mockContent = new Uint8Array(10000);
    const progressEvent = {
      item: new UploadItem(
        new File([mockContent], 'testfile.txt'),
        new FolderVO({
          displayName: 'testfolder',
          pathAsArchiveNbr: [],
          folderId: 10,
        }),
      ),
      statistics: { current: 1, total: 5, completed: 0, error: 0 },
      sessionStatus: UploadSessionStatus.InProgress,
    };

    mockUploadService.uploadSession.progress.emit(progressEvent);

    fixture.detectChanges();

    expect(find('.current-file').nativeElement.textContent.trim()).toBe(
      `Uploading ${progressEvent.item.file.name} to ${progressEvent.item.parentFolder.displayName}`,
    );

    const fileCountElements = find('.file-count strong');

    expect(fileCountElements[0].nativeElement.textContent).toEqual('1');

    expect(fileCountElements[1].nativeElement.textContent).toEqual('5');
  });

  it('should display the correct file name, the target folder and the current folder when dragging a file  nested into a folder over a folder', async () => {
    const { find, instance, fixture } = await shallow.render();

    const mockContent = new Uint8Array(10000);
    const progressEvent = {
      item: new UploadItem(
        new File([mockContent], 'testfile.txt'),
        new FolderVO({
          displayName: 'testfolder1',
          pathAsArchiveNbr: [],
          folderId: 9,
        }),
      ),
      statistics: { current: 1, total: 5, completed: 0, error: 0 },
      sessionStatus: UploadSessionStatus.InProgress,
    };

    mockUploadService.uploadSession.progress.emit(progressEvent);

    fixture.detectChanges();

    expect(find('.current-file').nativeElement.textContent.trim()).toBe(
      `Uploading ${progressEvent.item.file.name} to testfolder/${progressEvent.item.parentFolder.displayName}`,
    );

    const fileCountElements = find('.file-count strong');

    expect(fileCountElements[0].nativeElement.textContent).toEqual('1');

    expect(fileCountElements[1].nativeElement.textContent).toEqual('5');
  });
});

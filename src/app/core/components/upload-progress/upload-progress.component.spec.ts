import { NgModule, EventEmitter } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { UploadService } from '@core/services/upload/upload.service';
import {
	UploadProgressEvent,
	UploadSessionStatus,
} from '@core/services/upload/upload.session';
import { UploadItem } from '@core/services/upload/uploadItem';
import { FolderVO } from '@models/index';
import { UploadProgressComponent } from './upload-progress.component';

@NgModule()
class DummyModule {}

class MockUploadSession {
	public progress = new EventEmitter<UploadProgressEvent>();
}

const mockUploadService = {
	registerComponent: () => {},
	uploadSession: new MockUploadSession(),
	getTargetFolderId: () => 10,
	getTargetFolderName: () => 'testfolder',
};

describe('UploadProgressComponent', () => {
	beforeEach(async () => {
		await MockBuilder(UploadProgressComponent, DummyModule).provide({
			provide: UploadService,
			useValue: mockUploadService,
		});
	});

	it('should create', () => {
		const fixture = MockRender(UploadProgressComponent);

		expect(fixture.point.componentInstance).toBeTruthy();
	});

	it('should become visible when show() is called', () => {
		const fixture = MockRender(UploadProgressComponent);
		const instance = fixture.point.componentInstance;
		instance.show();

		expect(instance.visible).toBe(true);
	});

	it('should display the correct file name and the folder when dragging the file into a folder', () => {
		const fixture = MockRender(UploadProgressComponent);

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

		expect(ngMocks.find('.current-file').nativeElement.textContent.trim()).toBe(
			`Uploading ${progressEvent.item.file.name} to ${progressEvent.item.parentFolder.displayName}`,
		);

		const fileCountElements = ngMocks.findAll('.file-count strong');

		expect(fileCountElements[0].nativeElement.textContent).toEqual('1');

		expect(fileCountElements[1].nativeElement.textContent).toEqual('5');
	});

	it('should display the correct file name, the target folder and the current folder when dragging a file nested into a folder over a folder', () => {
		const fixture = MockRender(UploadProgressComponent);

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

		expect(ngMocks.find('.current-file').nativeElement.textContent.trim()).toBe(
			`Uploading ${progressEvent.item.file.name} to testfolder/${progressEvent.item.parentFolder.displayName}`,
		);

		const fileCountElements = ngMocks.findAll('.file-count strong');

		expect(fileCountElements[0].nativeElement.textContent).toEqual('1');

		expect(fileCountElements[1].nativeElement.textContent).toEqual('5');
	});
});

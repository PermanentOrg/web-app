import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { RecordVO } from '@root/app/models';
import { FileFormat, PermanentFile } from '@models/file-vo';
import { GetAltTextPipe } from '../../pipes/get-alt-text.pipe';
import { VideoComponent } from './video.component';

const ACCESS_COPY_URL = 'https://example.com/interviews-access.mp4';

const accessCopy: PermanentFile = {
	fileId: 3954090,
	size: 1064829289,
	format: FileFormat.ArchivematicaAccess,
	parentFileId: 3952677,
	fileURL: ACCESS_COPY_URL,
	downloadURL: ACCESS_COPY_URL,
	type: 'video/mp4',
};

describe('VideoComponent', () => {
	let component: VideoComponent;
	let fixture: ComponentFixture<VideoComponent>;

	const getProcessingMessage = (): Element | null =>
		fixture.nativeElement.querySelector('.message');

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.declarations.push(VideoComponent);
		config.declarations.push(GetAltTextPipe);

		TestBed.configureTestingModule(config).compileComponents();

		fixture = TestBed.createComponent(VideoComponent);
		component = fixture.componentInstance;
		component.item = new RecordVO({
			displayName: 'test video',
			type: 'type.record.video',
		});
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should show the processing message when the record has no files', () => {
		expect(component.isProcessing).toBeTrue();
		expect(getProcessingMessage()).not.toBeNull();
	});

	it('should play the access copy when the record already has files', () => {
		component.item = new RecordVO({
			displayName: 'test video',
			type: 'type.record.video',
			FileVOs: [accessCopy],
		});
		fixture.detectChanges();

		expect(component.isProcessing).toBeFalse();
		expect(component.videoSrc).toBe(ACCESS_COPY_URL);
		expect(getProcessingMessage()).toBeNull();
	});

	it('should stop showing the processing message when files arrive on the record it was given', () => {
		component.item.update({ FileVOs: [accessCopy] });
		fixture.detectChanges();

		expect(component.isProcessing).toBeFalse();
		expect(component.videoSrc).toBe(ACCESS_COPY_URL);
		expect(getProcessingMessage()).toBeNull();
	});
});

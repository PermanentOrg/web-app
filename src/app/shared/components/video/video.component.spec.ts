import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { RecordVO } from '@root/app/models';
import { FileFormat, PermanentFile } from '@models/file-vo';
import { GetAltTextPipe } from '../../pipes/get-alt-text.pipe';
import { VideoComponent } from './video.component';

describe('VideoComponent', () => {
	let component: VideoComponent;
	let fixture: ComponentFixture<VideoComponent>;

	function makeTestFile(params: Partial<PermanentFile> = {}): PermanentFile {
		return {
			fileId: 0,
			size: 0,
			format: FileFormat.Original,
			fileURL: 'https://example.test/original.mp4',
			downloadURL: 'https://example.test/original.mp4',
			type: 'video/mp4',
			...params,
		};
	}

	function processingMessage(): HTMLElement | null {
		return fixture.nativeElement.querySelector('.message');
	}

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.declarations.push(VideoComponent);
		config.declarations.push(GetAltTextPipe);

		TestBed.configureTestingModule(config).compileComponents();

		fixture = TestBed.createComponent(VideoComponent);
		component = fixture.componentInstance;
		component.item = new RecordVO({
			displayName: 'test video',
		});
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should show the processing message when the record has no files', () => {
		expect(component.isProcessing).toBeTrue();
		expect(processingMessage()).not.toBeNull();
	});

	it('should play the archivematica access copy when there is one', () => {
		component.item = new RecordVO({
			displayName: 'test video',
			FileVOs: [
				makeTestFile(),
				makeTestFile({
					format: FileFormat.ArchivematicaAccess,
					fileURL: 'https://example.test/access.mp4',
				}),
			],
		});
		fixture.detectChanges();

		expect(component.isProcessing).toBeFalse();
		expect(component.videoSrc).toBe('https://example.test/access.mp4');
		expect(processingMessage()).toBeNull();
	});

	it('should fall back to the original when there is no access copy', () => {
		component.item = new RecordVO({
			displayName: 'test video',
			FileVOs: [makeTestFile()],
		});
		fixture.detectChanges();

		expect(component.isProcessing).toBeFalse();
		expect(component.videoSrc).toBe('https://example.test/original.mp4');
	});

	it('should clear the processing message when the files arrive after init', () => {
		expect(component.isProcessing).toBeTrue();

		component.item.update({ FileVOs: [makeTestFile()] });
		fixture.detectChanges();

		expect(component.isProcessing).toBeFalse();
		expect(component.videoSrc).toBe('https://example.test/original.mp4');
		expect(processingMessage()).toBeNull();
	});

	it('should show the loader again while a newly arrived file loads', () => {
		expect(component.isLoading).toBeFalse();

		component.item.update({ FileVOs: [makeTestFile()] });
		fixture.detectChanges();

		expect(component.isLoading).toBeTrue();
	});
});

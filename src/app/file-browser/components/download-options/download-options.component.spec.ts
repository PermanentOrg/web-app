import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordVO } from '@models';
import {
	FileFormat,
	GeneratedFileStatus,
	PermanentFile,
} from '@models/file-vo';
import { DataService } from '@shared/services/data/data.service';
import { DownloadOptionsComponent } from './download-options.component';

const makeFile = (format: FileFormat, type: string): PermanentFile => ({
	fileId: 0,
	fileURL: '',
	downloadURL: '',
	size: 0,
	format,
	type,
});

describe('DownloadOptionsComponent', () => {
	let fixture: ComponentFixture<DownloadOptionsComponent>;
	let dataService: jasmine.SpyObj<DataService>;
	let record: RecordVO;

	const textOf = (selector: string): string[] =>
		Array.from(
			fixture.nativeElement.querySelectorAll(selector),
			(element: HTMLElement) => element.textContent.trim(),
		);

	const showRecord = (recordToShow: RecordVO): void => {
		fixture.componentRef.setInput('record', recordToShow);
		fixture.detectChanges();
	};

	const processingMessage = (): HTMLElement | null =>
		fixture.nativeElement.querySelector('.download-options-processing');

	beforeEach(async () => {
		dataService = jasmine.createSpyObj<DataService>('DataService', [
			'downloadFile',
		]);

		await TestBed.configureTestingModule({
			imports: [DownloadOptionsComponent],
			providers: [{ provide: DataService, useValue: dataService }],
		}).compileComponents();

		record = new RecordVO({ type: 'type.record.image' });
		record.FileVOs = [
			makeFile(FileFormat.Converted, 'photo.jpg'),
			makeFile(FileFormat.Original, 'photo.tiff'),
		];

		fixture = TestBed.createComponent(DownloadOptionsComponent);
		showRecord(record);
	});

	it('lists the original file first', () => {
		expect(textOf('.download-option-extension')).toEqual(['tiff', 'jpg']);
	});

	it('labels each option', () => {
		expect(textOf('.download-option-label')).toEqual([
			'Original',
			'Access copy',
		]);
	});

	it('labels options by file format rather than position', () => {
		const recordWithoutOriginal = new RecordVO({ type: 'type.record.image' });
		recordWithoutOriginal.FileVOs = [
			makeFile(FileFormat.Converted, 'photo.pdf'),
			makeFile(FileFormat.ArchivematicaAccess, 'photo.jpg'),
		];
		showRecord(recordWithoutOriginal);

		expect(textOf('.download-option-label')).toEqual([
			'Access copy',
			'Access copy',
		]);
	});

	it('marks an option without an extension as unknown', () => {
		const recordWithUnknownType = new RecordVO({
			type: 'type.record.unknown',
		});
		recordWithUnknownType.FileVOs = [
			makeFile(FileFormat.Original, 'type.file.unknown.null'),
		];
		showRecord(recordWithUnknownType);

		expect(textOf('.download-option-extension')).toEqual(['unknown']);
	});

	it('shows the icon for the record type', () => {
		const icon: HTMLElement = fixture.nativeElement.querySelector(
			'.download-option-icon',
		);

		expect(icon.style.maskImage).toContain(
			'assets/svg/record-type-thumbnail/image.svg',
		);
	});

	it('downloads the clicked option', () => {
		fixture.nativeElement.querySelectorAll('.download-option')[1].click();

		expect(dataService.downloadFile).toHaveBeenCalledWith(record, 'photo.jpg');
	});

	describe('processing message', () => {
		const documentRecord = (accessCopyStatus: GeneratedFileStatus): RecordVO =>
			new RecordVO({
				type: 'type.record.document',
				FileVOs: [makeFile(FileFormat.Original, 'type.file.document.docx')],
				accessCopyStatus,
			});

		it('is shown while the record is still processing', () => {
			showRecord(documentRecord(GeneratedFileStatus.Processing));

			expect(processingMessage().textContent).toContain(
				'More formats are on the way.',
			);
		});

		it('is hidden once processing has finished', () => {
			showRecord(documentRecord(GeneratedFileStatus.Ok));

			expect(processingMessage()).toBeNull();
		});

		it('is hidden when processing failed', () => {
			showRecord(documentRecord(GeneratedFileStatus.Failed));

			expect(processingMessage()).toBeNull();
		});

		it('is hidden for a record that is ready to view', () => {
			expect(processingMessage()).toBeNull();
		});

		it('keeps the dropdown open when clicked', () => {
			showRecord(documentRecord(GeneratedFileStatus.Processing));
			const documentClick = jasmine.createSpy('documentClick');
			document.addEventListener('click', documentClick);

			processingMessage().click();
			document.removeEventListener('click', documentClick);

			expect(documentClick).not.toHaveBeenCalled();
		});
	});
});

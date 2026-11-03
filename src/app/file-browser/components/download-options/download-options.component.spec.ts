import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordVO } from '@models';
import { FileFormat, PermanentFile } from '@models/file-vo';
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

	beforeEach(async () => {
		dataService = jasmine.createSpyObj<DataService>('DataService', [
			'downloadFile',
		]);

		await TestBed.configureTestingModule({
			imports: [DownloadOptionsComponent],
			providers: [{ provide: DataService, useValue: dataService }],
		}).compileComponents();

		record = new RecordVO({});
		record.FileVOs = [
			makeFile(FileFormat.Converted, 'photo.jpg'),
			makeFile(FileFormat.Original, 'photo.tiff'),
		];

		fixture = TestBed.createComponent(DownloadOptionsComponent);
		fixture.componentRef.setInput('record', record);
		fixture.detectChanges();
	});

	it('lists the original file first', () => {
		expect(textOf('.download-option-extension')).toEqual(['.tiff', '.jpg']);
	});

	it('labels each option', () => {
		expect(textOf('.download-option-label')).toEqual([
			'Original:',
			'Access copy:',
		]);
	});

	it('labels options by file format rather than position', () => {
		const recordWithoutOriginal = new RecordVO({});
		recordWithoutOriginal.FileVOs = [
			makeFile(FileFormat.Converted, 'photo.pdf'),
			makeFile(FileFormat.ArchivematicaAccess, 'photo.jpg'),
		];
		fixture.componentRef.setInput('record', recordWithoutOriginal);
		fixture.detectChanges();

		expect(textOf('.download-option-label')).toEqual([
			'Access copy:',
			'Access copy:',
		]);
	});

	it('downloads the clicked option', () => {
		fixture.nativeElement.querySelectorAll('.download-option')[1].click();

		expect(dataService.downloadFile).toHaveBeenCalledWith(record, 'photo.jpg');
	});
});

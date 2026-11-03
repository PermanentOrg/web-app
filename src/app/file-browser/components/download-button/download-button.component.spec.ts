import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { FolderVO, RecordVO } from '@models';
import { FileFormat, PermanentFile } from '@models/file-vo';
import { DownloadOptionsComponent } from '../download-options/download-options.component';
import { DownloadButtonComponent } from './download-button.component';

const makeFile = (format: FileFormat, type: string): PermanentFile => ({
	fileId: 0,
	fileURL: '',
	downloadURL: '',
	size: 0,
	format,
	type,
});

describe('DownloadButtonComponent', () => {
	let component: DownloadButtonComponent;
	let fixture: ComponentFixture<DownloadButtonComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DownloadButtonComponent],
			imports: [DownloadOptionsComponent],
			providers: [
				DataService,
				MessageService,
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		}).compileComponents();

		fixture = TestBed.createComponent(DownloadButtonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('zips a selected folder instead of listing options', async () => {
		const folder = new FolderVO({});
		const createZip = spyOn(
			TestBed.inject(DataService),
			'createZipForDownload',
		).and.resolveTo();
		const showMessage = spyOn(TestBed.inject(MessageService), 'showMessage');
		component.selectedItem = folder;

		await component.downloadClick();
		fixture.detectChanges();

		expect(createZip).toHaveBeenCalledWith([folder]);
		expect(showMessage).toHaveBeenCalledWith(
			jasmine.objectContaining({ style: 'success' }),
		);

		expect(component.displayDownloadDropdown).toBeFalse();
	});

	describe('with a record selected', () => {
		const optionExtensions = (): string[] =>
			Array.from(
				fixture.nativeElement.querySelectorAll('.download-option-extension'),
				(element: HTMLElement) => element.textContent.trim(),
			);

		beforeEach(async () => {
			const record = new RecordVO({});
			record.FileVOs = [
				makeFile(FileFormat.Converted, 'photo.jpg'),
				makeFile(FileFormat.Original, 'photo.tiff'),
			];
			component.selectedItem = record;
			await component.downloadClick();
			fixture.detectChanges();
		});

		it('shows the download options', () => {
			expect(optionExtensions()).toEqual(['.tiff', '.jpg']);
		});

		it('hides the download options when clicked again', async () => {
			await component.downloadClick();
			fixture.detectChanges();

			expect(optionExtensions()).toEqual([]);
		});

		it('hides the download options once a folder is selected', () => {
			component.selectedItem = new FolderVO({});
			fixture.detectChanges();

			expect(optionExtensions()).toEqual([]);
		});
	});
});

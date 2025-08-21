import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { DataService } from '@shared/services/data/data.service';
import { FolderVO, ArchiveVO, AccountVO } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { UploadButtonComponent } from './upload-button.component';

describe('UploadButtonComponent', () => {
	let component: UploadButtonComponent;
	let fixture: ComponentFixture<UploadButtonComponent>;

	let dataService: DataService;
	let accountService: AccountService;

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.declarations.push(UploadButtonComponent);
		config.imports.push(NgbTooltipModule);
		const providers = config.providers as any[];
		providers.push(DataService);
		providers.push(AccountService);
		TestBed.configureTestingModule(config).compileComponents();

		accountService = TestBed.inject(AccountService);
		accountService.setArchive(
			new ArchiveVO({
				accessRole: 'access.role.owner',
			}),
		);
		dataService = TestBed.inject(DataService);

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

	it('should be visible and enabled when current folder is not an apps folder', async () => {
		dataService.setCurrentFolder(
			new FolderVO({
				type: 'type.folder.private',
				accessRole: 'access.role.owner',
			}),
		);
		await fixture.whenStable();

		expect(component.hidden).toBeFalsy();
		expect(component.disabled).toBeFalsy();
	});

	it('should be disabled when current folder is an apps folder', async () => {
		dataService.setCurrentFolder(
			new FolderVO({
				accessRole: 'access.role.owner',
				type: 'type.folder.app',
			}),
		);
		await fixture.whenStable();

		expect(component.hidden).toBeFalsy();
		expect(component.disabled).toBeTruthy();
	});

	it('should be disabled when current folder does not have write access', async () => {
		dataService.setCurrentFolder(
			new FolderVO({
				type: 'type.folder.private',
				accessRole: 'access.role.viewer',
			}),
		);
		await fixture.whenStable();

		expect(component.hidden).toBeFalsy();
		expect(component.disabled).toBeTruthy();
	});

	it('should reset file input after a file is selected', async () => {
		const fileInput =
			fixture.debugElement.nativeElement.querySelector('input[type="file"]');

		const testFile = new File([''], 'test-file.txt');
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(testFile);
		fileInput.files = dataTransfer.files;

		fileInput.dispatchEvent(new Event('change'));
		fixture.detectChanges();
		await fixture.whenStable();

		expect(fileInput.files.length).toEqual(0);
	});

	it('will not block propagation of the file input click event', async () => {
		dataService.setCurrentFolder(
			new FolderVO({
				type: 'type.folder.private',
				accessRole: 'access.role.viewer',
			}),
		);
		accountService.setAccount(new AccountVO({ accountId: 1 }));

		expect(component.filePickerClick()).not.toBeFalsy();
	});
});

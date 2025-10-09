import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';
import { MainComponent } from '@core/components/main/main.component';
import { NavComponent } from '@core/components/nav/nav.component';
import { LeftMenuComponent } from '@core/components/left-menu/left-menu.component';
import { MessageService } from '@shared/services/message/message.service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { AccountService } from '@shared/services/account/account.service';
import { MessageComponent } from '@shared/components/message/message.component';
import { UploadProgressComponent } from '@core/components/upload-progress/upload-progress.component';
import { RightMenuComponent } from '@core/components/right-menu/right-menu.component';
import { UploadButtonComponent } from '@core/components/upload-button/upload-button.component';
import { SharedModule } from '@shared/shared.module';
import { DataService } from '@shared/services/data/data.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { GlobalSearchBarComponent } from '@search/components/global-search-bar/global-search-bar.component';
import { SearchService } from '@search/services/search.service';
import { TagsService } from '@core/services/tags/tags.service';
import {
	DragServiceEvent,
	DragService,
} from '@shared/services/drag/drag.service';
import { Subject } from 'rxjs';
import { FolderPickerComponent } from '../folder-picker/folder-picker.component';
import { MultiSelectStatusComponent } from '../multi-select-status/multi-select-status.component';
import { FolderVO } from '../../../models/folder-vo';
import { PromptService } from '../../../shared/services/prompt/prompt.service';

const defaultAuthData =
	require('@root/test/responses/auth.login.success.json') as any;

describe('MainComponent', () => {
	let component: MainComponent;
	let fixture: ComponentFixture<MainComponent>;

	let accountService: AccountService;
	let messageService: MessageService;
	let promptService: PromptService;
	let mockDragService: jasmine.SpyObj<DragService>;
	let mockDragEvents: Subject<DragServiceEvent>;

	async function init(authResponseData = defaultAuthData) {
		TestBed.resetTestingModule();
		mockDragEvents = new Subject<DragServiceEvent>();
		mockDragService = jasmine.createSpyObj('DragService', [
			'getDestinationFromDropTarget',
			'events',
		]);
		mockDragService.events.and.returnValue(mockDragEvents.asObservable());
		mockDragService.getDestinationFromDropTarget.and.returnValue(
			new FolderVO({ type: 'type.folder.public' }),
		);

		const config = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.imports.push(SharedModule);
		config.imports.push(NoopAnimationsModule);

		config.declarations.push(MainComponent);
		config.declarations.push(NavComponent);
		config.declarations.push(MessageComponent);
		config.declarations.push(LeftMenuComponent);
		config.declarations.push(RightMenuComponent);
		config.declarations.push(UploadProgressComponent);
		config.declarations.push(UploadButtonComponent);
		config.declarations.push(FolderPickerComponent);
		config.declarations.push(MultiSelectStatusComponent);
		config.declarations.push(GlobalSearchBarComponent);

		config.providers.push(AccountService);
		config.providers.push(DataService);
		config.providers.push(FolderPickerService);
		config.providers.push(SearchService);
		config.providers.push(TagsService);
		config.providers.push({ provide: DragService, useValue: mockDragService });

		await TestBed.configureTestingModule(config).compileComponents();

		const authResponse = new AuthResponse(authResponseData);
		accountService = TestBed.inject(AccountService);

		accountService.setAccount(authResponse.getAccountVO());
		accountService.setArchive(authResponse.getArchiveVO());

		messageService = TestBed.inject(MessageService);
		spyOn(messageService, 'showMessage');

		promptService = TestBed.inject(PromptService);
		spyOn(promptService, 'confirm');

		fixture = TestBed.createComponent(MainComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}

	afterEach(() => {
		const service = messageService as any;
		if (service && service.calls) {
			(service as any).calls.reset();
		}
	});

	it('should create', async () => {
		await init();

		expect(component).toBeTruthy();
	});

	it('should show a prompt when both email and phone are unverified', async () => {
		const data = require('@root/test/responses/auth.verify.unverifiedBoth.success.json');
		await init(data);

		expect(messageService.showMessage).toHaveBeenCalledTimes(1);
		expect(messageService.showMessage).toHaveBeenCalledWith({
			message:
				'Your email and phone number need verification. Tap this message to verify.',
			translate: false,
			style: 'info',
			navigateTo: ['/app/auth/verify'],
			navigateParams: {
				sendEmail: true,
				sendSms: true,
			},
		});
	});

	it('should show a prompt when only email is unverified', async () => {
		const data = require('@root/test/responses/auth.verify.unverifiedEmail.success.json');
		await init(data);

		expect(messageService.showMessage).toHaveBeenCalledTimes(1);
		expect(messageService.showMessage).toHaveBeenCalledWith({
			message: 'Your email needs verification. Tap this message to verify.',
			translate: false,
			style: 'info',
			navigateTo: ['/app/auth/verify'],
			navigateParams: {
				sendEmail: true,
			},
		});

		expect(messageService.showMessage).not.toHaveBeenCalledWith({
			message: 'email and phone',
		});
	});

	it('should show a prompt when only phone is unverified', async () => {
		const data = require('@root/test/responses/auth.verify.unverifiedPhone.success.json');
		await init(data);

		expect(messageService.showMessage).toHaveBeenCalledTimes(1);
		expect(messageService.showMessage).toHaveBeenCalledWith({
			message:
				'Your phone number needs verification. Tap this message to verify.',
			style: 'info',
			translate: false,
			navigateTo: ['/app/auth/verify'],
			navigateParams: {
				sendSms: true,
			},
		});

		expect(messageService.showMessage).not.toHaveBeenCalledWith({
			message: jasmine.stringMatching('email and phone') as unknown as string,
		});
	});

	it('should show a prompt when nothing is unverified', async () => {
		const data = require('@root/test/responses/auth.login.success.json');
		await init(data);

		expect(messageService.showMessage).toHaveBeenCalledTimes(0);
	});

	it('should show a prompt when trying to upload a file or folder to the public workspace', async () => {
		const data = require('@root/test/responses/auth.login.success.json');
		await init(data);
		const mockFiles = [new File([''], 'mockFile.txt')];
		const mockDragEvent = createMockDragEvent(mockFiles);

		const targetFolder = { isDropTarget: true };
		mockDragService.getDestinationFromDropTarget.and.returnValue(
			new FolderVO({ type: 'type.folder.public' }),
		);
		await component.onDrop(targetFolder, mockDragEvent);

		expect(promptService.confirm).toHaveBeenCalled();
	});
});

function createMockDragEvent(files: File[]): DragServiceEvent {
	const mockDragEvent = {
		preventDefault: () => {},
		stopPropagation: () => {},
	};

	Object.defineProperty(mockDragEvent, 'dataTransfer', {
		value: {
			files,
			items: files.map((file) => ({
				kind: 'file',
				getAsFile: () => file,
			})),
		},
		writable: true,
	});

	return {
		event: mockDragEvent,
		type: 'start',
		srcComponent: { onDrop: () => {} },
		targetTypes: ['folder'],
	};
}

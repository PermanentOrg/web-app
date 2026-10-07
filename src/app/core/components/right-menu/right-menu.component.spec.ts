import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { RightMenuComponent } from '@core/components/right-menu/right-menu.component';
import { FolderVO, ArchiveVO } from '@models';
import { DataService } from '@shared/services/data/data.service';
import { AccountService } from '@shared/services/account/account.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { EditService } from '@core/services/edit/edit.service';
import { MessageService } from '@shared/services/message/message.service';
import { GENERIC_FOLDER_ERROR_MESSAGE } from '@shared/utilities/folder-error-message';

describe('RightMenuComponent', () => {
	let component: RightMenuComponent;
	let fixture: ComponentFixture<RightMenuComponent>;
	let dataService: DataService;

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);
		const mockAccountService = {
			getArchive: function () {
				return new ArchiveVO({
					accessRole: 'access.role.owner',
				});
			},
			archiveChange: {
				subscribe: () => {},
			},
		};

		config.providers.push({
			provide: AccountService,
			useValue: mockAccountService,
		});

		config.declarations.push(RightMenuComponent);

		TestBed.configureTestingModule(config).compileComponents();

		fixture = TestBed.createComponent(RightMenuComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		dataService = TestBed.inject(DataService);
		dataService.setCurrentFolder();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have all folder actions in a folder you own', () => {
		dataService.setCurrentFolder(
			new FolderVO({
				type: 'type.folder.private',
				accessRole: 'access.role.owner',
			}),
		);

		expect(component.hasAllowedActions).toBeTruthy();
		expect(component.allowedActions.createFolder).toBeTruthy();
	});

	it('should have folder view actions in a folder you have viewer access to', () => {
		dataService.setCurrentFolder(
			new FolderVO({
				type: 'type.folder.private',
				accessRole: 'access.role.viewer',
			}),
		);

		expect(component.hasAllowedActions).toBeTruthy();
		expect(component.allowedActions.createFolder).toBeFalsy();
	});

	it('should have all folder actions in a folder you have editor access to', () => {
		dataService.setCurrentFolder(
			new FolderVO({
				type: 'type.folder.private',
				accessRole: 'access.role.editor',
			}),
		);

		expect(component.hasAllowedActions).toBeTruthy();
		expect(component.allowedActions.createFolder).toBeTruthy();
	});

	it('should have all folder actions in a folder you have contributor access to', () => {
		dataService.setCurrentFolder(
			new FolderVO({
				type: 'type.folder.private',
				accessRole: 'access.role.contributor',
			}),
		);

		expect(component.hasAllowedActions).toBeTruthy();
		expect(component.allowedActions.createFolder).toBeTruthy();
	});

	it('should have all folder actions in a folder you have curator access to', () => {
		dataService.setCurrentFolder(
			new FolderVO({
				type: 'type.folder.private',
				accessRole: 'access.role.curator',
			}),
		);

		expect(component.hasAllowedActions).toBeTruthy();
		expect(component.allowedActions.createFolder).toBeTruthy();
	});

	it('should have no view actions in a share root folder', () => {
		dataService.setCurrentFolder(
			new FolderVO({
				type: 'type.folder.root.share',
			}),
		);

		expect(component.hasAllowedActions).toBeFalsy();
		expect(component.allowedActions.createFolder).toBeFalsy();
	});

	it('should have no view actions in an apps folder', () => {
		dataService.setCurrentFolder(
			new FolderVO({
				type: 'type.folder.root.apps',
			}),
		);

		expect(component.hasAllowedActions).toBeFalsy();
		expect(component.allowedActions.createFolder).toBeFalsy();
	});

	describe('createNewFolder', () => {
		const newFolderName = 'Holidays';
		let createFolder: jasmine.Spy;
		let messageService: MessageService;
		let folderCreationPromise: Promise<unknown>;

		beforeEach(() => {
			dataService.setCurrentFolder(
				new FolderVO({
					type: 'type.folder.private',
					accessRole: 'access.role.owner',
				}),
			);
			spyOn(TestBed.inject(PromptService), 'prompt').and.callFake(
				async (fields, title, savePromise) => {
					folderCreationPromise = savePromise;
					return { folderName: newFolderName };
				},
			);
			createFolder = spyOn(TestBed.inject(EditService), 'createFolder');
			messageService = TestBed.inject(MessageService);
			spyOn(messageService, 'showMessage');
			spyOn(messageService, 'showError');
		});

		it('should create the folder in the current folder, refresh it and show the new folder', async () => {
			const createdFolder = new FolderVO({ displayName: newFolderName });
			createFolder.and.resolveTo(createdFolder);
			const refreshCurrentFolder = spyOn(
				dataService,
				'refreshCurrentFolder',
			).and.resolveTo();
			const showItem = spyOn(dataService, 'showItem');

			await component.createNewFolder();
			await expectAsync(folderCreationPromise).toBeResolved();

			expect(createFolder).toHaveBeenCalledWith(
				newFolderName,
				component.currentFolder,
			);

			expect(messageService.showMessage).toHaveBeenCalledWith({
				message: `Folder "${newFolderName}" has been created`,
				style: 'success',
			});

			expect(refreshCurrentFolder).toHaveBeenCalled();
			expect(showItem).toHaveBeenCalledWith(createdFolder);
		});

		it('should show the generic folder error and reject the prompt when creating the folder fails', async () => {
			createFolder.and.rejectWith(new Error('stela is down'));

			await component.createNewFolder();
			await expectAsync(folderCreationPromise).toBeRejected();

			expect(messageService.showError).toHaveBeenCalledWith({
				message: GENERIC_FOLDER_ERROR_MESSAGE,
				translate: true,
			});
		});
	});
});

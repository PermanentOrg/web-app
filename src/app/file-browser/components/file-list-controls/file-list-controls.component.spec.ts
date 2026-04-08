import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataService } from '@shared/services/data/data.service';
import { EditService } from '@core/services/edit/edit.service';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { EventService } from '@shared/services/event/event.service';
import { Subject, of } from 'rxjs';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { AccessRole } from '@models';
import { ElementRef } from '@angular/core';
import { TooltipsPipe } from '@shared/pipes/tooltips.pipe';
import { FileListControlsComponent } from './file-list-controls.component';

import { vi } from 'vitest';

describe('FileListControlsComponent', () => {
	let component: FileListControlsComponent;
	let fixture: ComponentFixture<FileListControlsComponent>;

	const dataServiceMock = {
		currentFolder: {
			sort: 'sort.alphabetical_asc',
			accessRole: AccessRole.Manager,
		},
		selectedItems$: () => of([]),
		refreshCurrentFolder: vi.fn()
			.mockReturnValue(Promise.resolve(true)),
	};

	const editServiceMock = {
		deleteItems: vi.fn(),
		unshareItem: vi.fn(),
		openFolderPicker: vi.fn(),
		openShareDialog: vi.fn(),
		openPublishDialog: vi.fn(),
	};

	const accountServiceMock = {
		checkMinimumAccess: vi.fn()
			.mockReturnValue(true),
		checkMinimumArchiveAccess: vi.fn()
			.mockReturnValue(true),
		getArchive: vi.fn()
			.mockReturnValue({ accessRole: AccessRole.Manager }),
		deductAccountStorage: vi.fn(),
	};

	const apiServiceMock = {
		folder: {
			sort: vi.fn().mockReturnValue(Promise.resolve(true)),
		},
	};

	const promptServiceMock = {
		confirmBoolean: vi.fn()
			.mockReturnValue(Promise.resolve(true)),
	};

	const messageServiceMock = {
		showError: vi.fn(),
		showMessage: vi.fn(),
	};

	const folderViewServiceMock = {
		folderView: FolderView.List,
		viewChange: new Subject<FolderView>(),
	};

	const eventServiceMock = {
		dispatch: vi.fn(),
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [FileListControlsComponent, TooltipsPipe],
			providers: [
				{ provide: DataService, useValue: dataServiceMock },
				{ provide: EditService, useValue: editServiceMock },
				{ provide: AccountService, useValue: accountServiceMock },
				{ provide: ApiService, useValue: apiServiceMock },
				{ provide: PromptService, useValue: promptServiceMock },
				{ provide: MessageService, useValue: messageServiceMock },
				{ provide: FolderViewService, useValue: folderViewServiceMock },
				{ provide: EventService, useValue: eventServiceMock },
				{
					provide: ElementRef,
					useValue: new ElementRef({ nativeElement: {} }),
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(FileListControlsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});
});

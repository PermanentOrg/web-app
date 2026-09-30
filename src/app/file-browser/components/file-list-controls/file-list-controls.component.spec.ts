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
import { Router } from '@angular/router';
import { TooltipsPipe } from '@shared/pipes/tooltips.pipe';
import { FileListControlsComponent } from './file-list-controls.component';

describe('FileListControlsComponent', () => {
	let component: FileListControlsComponent;
	let fixture: ComponentFixture<FileListControlsComponent>;

	const dataServiceMock = {
		currentFolder: {
			sort: 'sort.alphabetical_asc',
			accessRole: AccessRole.Manager,
		},
		selectedItems$: () => of([]),
		refreshCurrentFolder: jasmine
			.createSpy('refreshCurrentFolder')
			.and.returnValue(Promise.resolve(true)),
	};

	const editServiceMock = {
		deleteItems: jasmine.createSpy('deleteItems'),
		unshareItem: jasmine.createSpy('unshareItem'),
		openFolderPicker: jasmine.createSpy('openFolderPicker'),
		openShareDialog: jasmine.createSpy('openShareDialog'),
		openPublishDialog: jasmine.createSpy('openPublishDialog'),
	};

	const accountServiceMock = {
		checkMinimumAccess: jasmine
			.createSpy('checkMinimumAccess')
			.and.returnValue(true),
		checkMinimumArchiveAccess: jasmine
			.createSpy('checkMinimumArchiveAccess')
			.and.returnValue(true),
		getArchive: jasmine
			.createSpy('getArchive')
			.and.returnValue({ accessRole: AccessRole.Manager }),
		deductAccountStorage: jasmine.createSpy('deductAccountStorage'),
	};

	const apiServiceMock = {
		folder: {
			sort: jasmine.createSpy('sort').and.returnValue(Promise.resolve(true)),
		},
	};

	const promptServiceMock = {
		confirmBoolean: jasmine
			.createSpy('confirmBoolean')
			.and.returnValue(Promise.resolve(true)),
	};

	const messageServiceMock = {
		showError: jasmine.createSpy('showError'),
		showMessage: jasmine.createSpy('showMessage'),
	};

	const folderViewServiceMock = {
		folderView: FolderView.List,
		viewChange: new Subject<FolderView>(),
	};

	const eventServiceMock = {
		dispatch: jasmine.createSpy('dispatch'),
	};

	let routerMock: { url: string; navigate: jasmine.Spy };

	beforeEach(async () => {
		routerMock = {
			url: '/app/private',
			navigate: jasmine.createSpy('navigate'),
		};

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
				{ provide: Router, useValue: routerMock },
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

	it('shows a slideshow button in the file browser', () => {
		const button = fixture.nativeElement.querySelector('.slideshow-button');

		expect(button).toBeTruthy();
	});

	it('hides the slideshow button outside the file browser', () => {
		routerMock.url = '/app/shares';
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('.slideshow-button')).toBeNull();
	});

	it('navigates to the slideshow when the button is clicked', () => {
		fixture.nativeElement.querySelector('.slideshow-button').click();

		expect(routerMock.navigate).toHaveBeenCalledWith(
			jasmine.arrayContaining(['/app/private', 'view', 'slideshow']),
		);
	});
});

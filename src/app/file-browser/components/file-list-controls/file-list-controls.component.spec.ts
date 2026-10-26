import {
	ComponentFixture,
	TestBed,
	fakeAsync,
	flushMicrotasks,
} from '@angular/core/testing';
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
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FileListControlsComponent } from './file-list-controls.component';

describe('FileListControlsComponent', () => {
	let component: FileListControlsComponent;
	let fixture: ComponentFixture<FileListControlsComponent>;

	const dataServiceMock = {
		currentFolder: {
			sort: 'sort.alphabetical_asc',
			accessRole: AccessRole.Manager,
		},
		currentFolderChange: new Subject<unknown>(),
		selectedItems$: () => of([]),
		sortCurrentFolder: jasmine
			.createSpy('sortCurrentFolder')
			.and.callFake((sort: string) => {
				dataServiceMock.currentFolder.sort = sort;
			}),
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

	const initialFolder = dataServiceMock.currentFolder;

	beforeEach(async () => {
		dataServiceMock.currentFolder = initialFolder;
		dataServiceMock.currentFolder.sort = 'sort.alphabetical_asc';
		dataServiceMock.sortCurrentFolder.calls.reset();
		apiServiceMock.folder.sort.calls.reset();
		apiServiceMock.folder.sort.and.returnValue(Promise.resolve(true));
		messageServiceMock.showError.calls.reset();
		accountServiceMock.checkMinimumAccess.and.returnValue(true);

		await TestBed.configureTestingModule({
			imports: [NgbDropdownModule],
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

	it('should sort and save the sort as the folder default', fakeAsync(() => {
		component.onSortClick('date');
		flushMicrotasks();

		expect(dataServiceMock.sortCurrentFolder).toHaveBeenCalledWith(
			'sort.display_date_asc',
		);

		expect(apiServiceMock.folder.sort).toHaveBeenCalledOnceWith([
			dataServiceMock.currentFolder,
		]);

		expect(component.savedSortType).toBe('sort.display_date_asc');
		expect(component.currentSort).toBe('date');
		expect(component.sortDesc).toBeFalse();
	}));

	it('should flip the direction when the active column is clicked again', () => {
		component.onSortClick('name');

		expect(dataServiceMock.sortCurrentFolder).toHaveBeenCalledWith(
			'sort.alphabetical_desc',
		);

		expect(component.sortDesc).toBeTrue();
	});

	it('should neither sort nor save for users who cannot save the sort', fakeAsync(() => {
		component.canSaveSort = false;

		component.onSortClick('type');
		flushMicrotasks();

		expect(dataServiceMock.sortCurrentFolder).not.toHaveBeenCalled();
		expect(apiServiceMock.folder.sort).not.toHaveBeenCalled();
	}));

	it('should neither sort nor save when sorting is not allowed', fakeAsync(() => {
		component.allowSort = false;

		component.onSortClick('type');
		flushMicrotasks();

		expect(dataServiceMock.sortCurrentFolder).not.toHaveBeenCalled();
		expect(apiServiceMock.folder.sort).not.toHaveBeenCalled();
	}));

	it('should only save the latest sort when clicks happen during a save', fakeAsync(() => {
		const savedSorts: string[] = [];
		const pendingSaves: Array<() => void> = [];
		apiServiceMock.folder.sort.and.callFake(
			async (folders: Array<{ sort: string }>) => {
				savedSorts.push(folders[0].sort);
				await new Promise<void>((resolve) => {
					pendingSaves.push(resolve);
				});
				return true;
			},
		);

		component.onSortClick('type');
		component.onSortClick('type');
		component.onSortClick('date');
		pendingSaves.shift()();
		flushMicrotasks();
		pendingSaves.shift()();
		flushMicrotasks();

		expect(savedSorts).toEqual(['sort.type_asc', 'sort.display_date_asc']);
		expect(component.savedSortType).toBe('sort.display_date_asc');
	}));

	it('should go back to the saved sort and show an error when saving fails', fakeAsync(() => {
		apiServiceMock.folder.sort.and.returnValue(Promise.reject(new Error()));

		component.onSortClick('date');
		flushMicrotasks();

		expect(dataServiceMock.sortCurrentFolder).toHaveBeenCalledWith(
			'sort.alphabetical_asc',
		);

		expect(dataServiceMock.currentFolder.sort).toBe('sort.alphabetical_asc');
		expect(component.currentSort).toBe('name');
		expect(messageServiceMock.showError).toHaveBeenCalledTimes(1);
		expect(apiServiceMock.folder.sort).toHaveBeenCalledTimes(1);
	}));

	it('should not revert the sort when the folder changed before saving failed', fakeAsync(() => {
		const otherFolder = {
			sort: 'sort.type_asc',
			accessRole: AccessRole.Manager,
		};
		apiServiceMock.folder.sort.and.callFake(async () => {
			dataServiceMock.currentFolder = otherFolder;
			throw new Error();
		});

		component.onSortClick('date');
		flushMicrotasks();

		expect(dataServiceMock.sortCurrentFolder).toHaveBeenCalledTimes(1);
		expect(otherFolder.sort).toBe('sort.type_asc');
		expect(messageServiceMock.showError).toHaveBeenCalledTimes(1);
	}));

	describe('after navigating to another folder', () => {
		const otherFolder = {
			sort: 'sort.display_date_desc',
			accessRole: AccessRole.Manager,
		};

		function navigateToOtherFolder() {
			dataServiceMock.currentFolder = otherFolder;
			dataServiceMock.currentFolderChange.next(otherFolder);
		}

		beforeEach(() => {
			otherFolder.sort = 'sort.display_date_desc';
		});

		it('should show the sort of the new folder', () => {
			navigateToOtherFolder();

			expect(component.currentSort).toBe('date');
			expect(component.sortDesc).toBeTrue();
			expect(component.savedSortType).toBe('sort.display_date_desc');
		});

		it('should check the save permission against the new folder', () => {
			accountServiceMock.checkMinimumAccess.and.returnValue(false);

			navigateToOtherFolder();

			expect(accountServiceMock.checkMinimumAccess).toHaveBeenCalledWith(
				otherFolder.accessRole,
				AccessRole.Curator,
			);

			expect(component.canSaveSort).toBeFalse();
		});

		it('should go back to the new folder saved sort when saving there fails', fakeAsync(() => {
			navigateToOtherFolder();
			apiServiceMock.folder.sort.and.returnValue(Promise.reject(new Error()));

			component.onSortClick('name');
			flushMicrotasks();

			expect(dataServiceMock.sortCurrentFolder).toHaveBeenCalledWith(
				'sort.display_date_desc',
			);

			expect(otherFolder.sort).toBe('sort.display_date_desc');
		}));

		it('should save the new folder sort while the previous folder is still saving', fakeAsync(() => {
			const previousFolder = dataServiceMock.currentFolder;
			const savedFolders: unknown[] = [];
			const pendingSaves: Array<() => void> = [];
			apiServiceMock.folder.sort.and.callFake(async (folders: unknown[]) => {
				savedFolders.push(folders[0]);
				await new Promise<void>((resolve) => {
					pendingSaves.push(resolve);
				});
				return true;
			});

			component.onSortClick('type');
			navigateToOtherFolder();
			component.onSortClick('name');

			expect(savedFolders).toEqual([previousFolder, otherFolder]);

			pendingSaves.shift()();
			flushMicrotasks();

			expect(component.savedSortType).toBe('sort.display_date_desc');

			pendingSaves.shift()();
			flushMicrotasks();

			expect(component.savedSortType).toBe('sort.alphabetical_asc');
			expect(apiServiceMock.folder.sort).toHaveBeenCalledTimes(2);
		}));
	});

	it('should ignore a new sort while a sort is still being applied', () => {
		const isSortingSubscription = component.isSorting$.subscribe(
			(isSorting) => {
				if (isSorting) {
					component.setSort('sort.type_asc');
				}
			},
		);

		component.setSort('sort.display_date_asc');
		isSortingSubscription.unsubscribe();

		expect(dataServiceMock.sortCurrentFolder).toHaveBeenCalledOnceWith(
			'sort.display_date_asc',
		);
	});

	it('should show the sort indicator only to users who can save the sort', () => {
		const sortIndicatorSelector = '.col-title.has-sort-indicator';

		expect(
			fixture.nativeElement.querySelectorAll(sortIndicatorSelector).length,
		).toBe(3);

		component.canSaveSort = false;
		fixture.detectChanges();

		expect(
			fixture.nativeElement.querySelectorAll(sortIndicatorSelector).length,
		).toBe(0);
	});

	describe('in grid view', () => {
		const sortDropdownSelector = '.single-col-sort';

		beforeEach(() => {
			component.currentFolderView = FolderView.Grid;
		});

		it('should show the sort dropdown to users who can save the sort', () => {
			fixture.detectChanges();

			expect(
				fixture.nativeElement.querySelector(sortDropdownSelector),
			).not.toBeNull();
		});

		it('should hide the sort dropdown from users who cannot save the sort', () => {
			component.canSaveSort = false;
			fixture.detectChanges();

			expect(
				fixture.nativeElement.querySelector(sortDropdownSelector),
			).toBeNull();
		});

		it('should hide the sort dropdown when sorting is not allowed', () => {
			component.allowSort = false;
			fixture.detectChanges();

			expect(
				fixture.nativeElement.querySelector(sortDropdownSelector),
			).toBeNull();
		});
	});
});

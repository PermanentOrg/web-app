import {
	ComponentFixture,
	fakeAsync,
	TestBed,
	tick,
} from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { of, Subject, Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { UP_ARROW } from '@angular/cdk/keycodes';
import { RecordVO } from '@root/app/models';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { DataService } from '@shared/services/data/data.service';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { AccountService } from '@shared/services/account/account.service';
import { DragService } from '@shared/services/drag/drag.service';
import { DeviceService } from '@shared/services/device/device.service';
import { EventService } from '@shared/services/event/event.service';
import { ShareLinksService } from '@root/app/share-links/services/share-links.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { FileListComponent } from './file-list.component';

@Component({ template: '' })
class DummyComponent {}

describe('FileListComponent', () => {
	let component: FileListComponent;
	let fixture: ComponentFixture<FileListComponent>;

	const mockFolder: any = {
		type: 'type.folder.root.private',
		ChildItemVOs: [{ folder_linkId: 123 } as RecordVO],
	};

	const routerEvents$ = new Subject<any>();

	const mockActivatedRoute = {
		snapshot: {
			data: {
				currentFolder: mockFolder,
				showSidebar: true,
				fileListCentered: false,
				noFileListNavigation: false,
				isPublicArchive: false,
				showFolderDescription: true,
			},
			queryParamMap: {
				has: () => true,
				get: () => '123',
			},
		},
	};

	const mockRouter = {
		events: routerEvents$,
		url: '/folder',
		navigateByUrl: jasmine.createSpy(),
		navigate: jasmine.createSpy(),
	};

	const mockDataService = {
		setCurrentFolder: jasmine.createSpy(),
		onSelectEvent: jasmine.createSpy(),
		folderUpdate: of(mockFolder),
		multiSelectChange: of(true),
		selectedItems$: () => of(new Set()),
		itemToShow$: () => of(mockFolder.ChildItemVOs[0]),
		fetchLeanItems: jasmine.createSpy().and.returnValue(Promise.resolve()),
	};

	const mockDeviceService = {
		isMobileWidth: jasmine.createSpy().and.returnValue(false),
	};

	const mockFolderViewService = {
		folderView: 'List',
		viewChange: of('Grid'),
	};

	const mockAccountService = {
		archiveChange: of({}),
	};

	const mockEventService = {
		dispatch: jasmine.createSpy(),
	};

	const mockShareLinksService = {
		isUnlistedShare: jasmine
			.createSpy()
			.and.returnValue(Promise.resolve(false)),
	};

	const mockDragService = {
		events: () => of({ type: 'start' }),
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				RouterTestingModule.withRoutes([
					{ path: '', component: DummyComponent },
					{ path: 'view', component: DummyComponent },
				]),
				BrowserAnimationsModule,
			],
			declarations: [FileListComponent],
			providers: [
				{ provide: ActivatedRoute, useValue: mockActivatedRoute },
				{ provide: Router, useValue: mockRouter },
				{ provide: DataService, useValue: mockDataService },
				{ provide: FolderViewService, useValue: mockFolderViewService },
				{ provide: AccountService, useValue: mockAccountService },
				{ provide: DragService, useValue: mockDragService },
				{ provide: DeviceService, useValue: mockDeviceService },
				{ provide: EventService, useValue: mockEventService },
				{ provide: ShareLinksService, useValue: mockShareLinksService },
				{ provide: Location, useValue: { replaceState: jasmine.createSpy() } },
				{ provide: DOCUMENT, useValue: document },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(FileListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should initialize and dispatch workspace event', () => {
		expect(component.currentFolder).toEqual(mockFolder);
		expect(mockEventService.dispatch).toHaveBeenCalledWith({
			action: 'open_private_workspace',
			entity: 'account',
		});
	});

	it('should handle ngAfterViewInit and scroll to item', fakeAsync(() => {
		component = fixture.componentInstance;
		spyOn(component, 'scrollToItem');
		component.listItemsQuery = {
			toArray: () => [],
		} as any;
		component.ngAfterViewInit();

		expect(component.scrollToItem).toHaveBeenCalledWith(
			mockFolder.ChildItemVOs[0],
		);

		tick(1000);

		expect(mockDataService.onSelectEvent).toHaveBeenCalledWith({
			type: 'click',
			item: mockFolder.ChildItemVOs[0],
		});
	}));

	it('should clean up on ngOnDestroy', () => {
		const sub = new Subscription();
		spyOn(sub, 'unsubscribe');
		component.subscriptions = [sub];

		component.ngOnDestroy();

		expect(mockDataService.setCurrentFolder).toHaveBeenCalled();
		expect(sub.unsubscribe).toHaveBeenCalled();
	});

	it('should emit itemClicked and dispatch select event', () => {
		const item = mockFolder.ChildItemVOs[0];
		const clickEvent: any = {
			item,
			selectable: true,
			event: { ctrlKey: true },
		};

		spyOn(component.itemClicked, 'emit');
		component.showSidebar = true;

		component.onItemClick(clickEvent);

		expect(component.itemClicked.emit).toHaveBeenCalledWith(clickEvent);
		expect(mockDataService.onSelectEvent).toHaveBeenCalledWith({
			type: 'click',
			item,
			modifierKey: 'ctrl',
		});
	});

	it('should handle keyboard arrow selection', () => {
		const event = new KeyboardEvent('keydown', { keyCode: UP_ARROW });
		spyOn(component, 'checkKeyEvent').and.returnValue(true);

		component.onWindowKeydown(event);

		expect(mockDataService.onSelectEvent).toHaveBeenCalledWith({
			type: 'key',
			key: 'up',
		});
	});

	it('should handle ctrl+a selection', () => {
		const event = new KeyboardEvent('keydown', { ctrlKey: true });
		spyOn(component, 'checkKeyEvent').and.returnValue(true);

		component.onSelectAllKeypress(event);

		expect(mockDataService.onSelectEvent).toHaveBeenCalledWith({
			type: 'key',
			key: 'a',
			modifierKey: 'ctrl',
		});
	});

	it('should add/remove visible items on onItemVisible', () => {
		const mockComponent = {} as FileListItemComponent;
		const visibleEvent: any = { visible: true, component: mockComponent };
		const hiddenEvent: any = { visible: false, component: mockComponent };

		component.onItemVisible(visibleEvent);

		expect(component.visibleItems.has(mockComponent)).toBeTrue();

		component.onItemVisible(hiddenEvent);

		expect(component.visibleItems.has(mockComponent)).toBeFalse();
	});
});

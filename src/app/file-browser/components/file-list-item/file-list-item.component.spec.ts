import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, Pipe, PipeTransform } from '@angular/core';
import { Subject, of } from 'rxjs';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';

import { DataService } from '@shared/services/data/data.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { AccountService } from '@shared/services/account/account.service';
import { DragService } from '@shared/services/drag/drag.service';
import { ShareLinksService } from '@root/app/share-links/services/share-links.service';
import { EditService } from '@core/services/edit/edit.service';
import { DeviceService } from '@shared/services/device/device.service';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { GetThumbnailPipe } from '@shared/pipes/get-thumbnail.pipe';
import { FileListItemComponent } from './file-list-item.component';

@Pipe({ name: 'itemTypeIcon' })
class MockItemTypeIconPipe implements PipeTransform {
	transform(value: any): any {
		return value;
	}
}

@Pipe({ name: 'prDate' })
export class MockPrDatePipe implements PipeTransform {
	transform(value: any, ...args: any[]): string {
		return String(value ?? '');
	}
}

@Pipe({ name: 'prConstants' })
export class MockPrConstantsPipe implements PipeTransform {
	transform(value: string): string {
		return `mocked-${value}`;
	}
}

describe('FileListItemComponent', () => {
	let component: FileListItemComponent;
	let fixture: ComponentFixture<FileListItemComponent>;
	let editService: EditService;
	let thumbnailUpdatedSubject: Subject<any>;

	const activatedRouteMock = {
		snapshot: {
			data: {},
		},
		parent: {
			snapshot: {
				data: {
					sharePreviewVO: {
						previewToggle: 1,
					},
				},
			},
		},
	};

	const mockEditService = {
		moveItems: jasmine.createSpy().and.returnValue(Promise.resolve()),
		updateItems: jasmine.createSpy().and.returnValue(Promise.resolve()),
	};

	const mockDeviceService = {
		isMobileWidth: jasmine.createSpy().and.returnValue(false),
	};

	beforeEach(async () => {
		thumbnailUpdatedSubject = new Subject<any>();

		await TestBed.configureTestingModule({
			imports: [MockItemTypeIconPipe, MockPrDatePipe, MockPrConstantsPipe],
			declarations: [FileListItemComponent, GetThumbnailPipe],
			providers: [
				provideNoopAnimations(),
				provideRouter([]),
				{ provide: ActivatedRoute, useValue: activatedRouteMock },
				{ provide: ElementRef, useValue: { nativeElement: {} } },
				{
					provide: DataService,
					useValue: {
						registerItem: jasmine.createSpy(),
						unregisterItem: jasmine.createSpy(),
						getSelectedItems: () => new Map(),
						beginPreparingForNavigate: jasmine.createSpy(),
						fetchLeanItems: jasmine.createSpy(),
						setItemMultiSelectStatus: jasmine.createSpy(),
						thumbnailUpdated$: () => thumbnailUpdatedSubject.asObservable(),
						currentFolder: { type: '' },
					},
				},
				{
					provide: PromptService,
					useValue: {
						prompt: jasmine
							.createSpy()
							.and.returnValue(
								Promise.resolve({ displayName: 'Updated Name' }),
							),
						confirm: jasmine.createSpy().and.returnValue(Promise.resolve()),
					},
				},
				{
					provide: ApiService,
					useValue: { folder: { getWithChildren: jasmine.createSpy() } },
				},
				{
					provide: MessageService,
					useValue: { showError: jasmine.createSpy() },
				},
				{
					provide: AccountService,
					useValue: {
						getArchive: () => ({ archiveId: '123' }),
						checkMinimumAccess: () => true,
					},
				},
				{
					provide: DragService,
					useValue: {
						events: () => of(),
						dispatch: jasmine.createSpy(),
						getDestinationFromDropTarget: () => ({
							displayName: 'Target Folder',
						}),
					},
				},
				{
					provide: ShareLinksService,
					useValue: {
						isUnlistedShare: async () => await Promise.resolve(false),
					},
				},
				{ provide: EditService, useValue: mockEditService },
				{ provide: DeviceService, useValue: mockDeviceService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(FileListItemComponent);
		component = fixture.componentInstance;
		editService = TestBed.inject(EditService);

		component.item = {
			displayDT: new Date().toISOString(),
			displayName: 'Test Item',
			archiveNbr: '123',
			folder_linkId: '456',
			type: '',
			isFolder: false,
			isRecord: false,
			dataStatus: 0,
			isFetching: false,
			update: jasmine.createSpy(),
			fetched: Promise.resolve(true),
		} as any;

		component.folderView = '' as any;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should register and unregister item', async () => {
		await component.ngOnInit();

		expect(TestBed.inject(DataService).registerItem).toHaveBeenCalled();
		component.ngOnDestroy();
	});

	it('should handle drag events', () => {
		const dragEvent = {
			type: 'start',
			srcComponent: {},
			targetTypes: ['folder'],
		} as any;
		component.item.isFolder = true;
		component.onDragServiceEvent(dragEvent);

		expect(component.isDragTarget).toBeTrue();
	});

	it('should handle drop and confirm move', async () => {
		await component.onDrop({} as any);

		expect(editService.moveItems).toHaveBeenCalled();
	});

	it('should reject drop and show error', async () => {
		editService.moveItems = jasmine
			.createSpy()
			.and.returnValue(Promise.reject({ getMessage: () => 'Error' }));
		await component.onDrop({} as any).catch(() => {
			expect(TestBed.inject(MessageService).showError).toHaveBeenCalledWith({
				message: 'Error occurred',
			});
		});
	});

	it('should preview unlisted record', () => {
		component.isUnlistedShare = true;
		component.item.isFolder = false;
		spyOn(component, 'goToItem');
		component.onItemClick({} as MouseEvent);

		expect(component.goToItem).toHaveBeenCalled();
	});

	it('should emit itemClicked on mobile or non-selectable', () => {
		component.isUnlistedShare = false;
		component.canSelect = false;
		mockDeviceService.isMobileWidth.and.returnValue(true);
		spyOn(component.itemClicked, 'emit');
		spyOn(component, 'goToItem');
		component.onItemClick(new MouseEvent('click'));

		expect(component.goToItem).toHaveBeenCalled();
		expect(component.itemClicked.emit).toHaveBeenCalled();
	});

	it('should handle double click and clear timeout', () => {
		(component as any).singleClickTimeout = setTimeout(() => {}, 100);
		spyOn(component, 'goToItem');
		component.onItemDoubleClick();

		expect((component as any).singleClickTimeout).toBeNull();
		expect(component.goToItem).toHaveBeenCalled();
	});

	it('should emit itemClicked on single click', (done) => {
		spyOn(component.itemClicked, 'emit');
		component.onItemSingleClick(new MouseEvent('click'));
		setTimeout(() => {
			expect(component.itemClicked.emit).toHaveBeenCalled();
			done();
		}, 150);
	});

	it('should handle touch click', () => {
		const mockTouch = { clientX: 100, clientY: 100 };
		const touchStartEvent = { touches: { item: () => mockTouch } };
		const touchEndEvent = {
			changedTouches: { item: () => mockTouch },
			preventDefault: () => {},
			target: {
				classList: {
					contains: () => false,
				},
			},
		};
		spyOn(component, 'onItemClick');
		component.onItemTouchStart(touchStartEvent);
		component.onItemTouchEnd(touchEndEvent as any);

		expect(component.onItemClick).toHaveBeenCalled();
	});

	it('should prompt for update and save changes', async () => {
		await component.promptForUpdate();

		expect(component.item.update).toHaveBeenCalled();
		expect(editService.updateItems).toHaveBeenCalled();
	});

	it('should resolve update if no changes', () => {
		const { promise, resolve, reject } = Promise.withResolvers();
		component.item.displayName = 'Same';
		component.saveUpdates({ displayName: 'Same' }, { resolve, reject });
		promise.then(() => {
			expect(component.item.update).not.toHaveBeenCalled();
		});
	});

	it('should reject update and restore original data', async () => {
		const { promise, resolve, reject } = Promise.withResolvers();
		editService.updateItems = jasmine
			.createSpy()
			.and.returnValue(Promise.reject({ getMessage: () => 'Error' }));
		component.saveUpdates({ displayName: 'New' }, { resolve, reject });
		try {
			await promise;
		} catch {
			expect(component.item.update).toHaveBeenCalledWith({
				displayName: 'Test Item',
			});

			expect(TestBed.inject(MessageService).showError).toHaveBeenCalled();
		}
	});

	it('should update multi-select status', () => {
		component.isMultiSelected = true;
		component.onMultiSelectChange();

		expect(
			TestBed.inject(DataService).setItemMultiSelectStatus,
		).toHaveBeenCalledWith(component.item, true);
	});

	it('should emit itemVisible on intersection', () => {
		spyOn(component.itemVisible, 'emit');
		component.onIntersection({ target: {} as Element, visible: true });

		expect(component.itemVisible.emit).toHaveBeenCalled();
	});

	it('should toggle hover flags', () => {
		component.onMouseOverName();

		expect(component.isNameHovered).toBeTrue();
		component.onMouseLeaveName();

		expect(component.isNameHovered).toBeFalse();
	});

	it('should set random preview thumbnail for non-unlisted share records', async () => {
		const router = TestBed.inject(Router);
		(router.routerState.snapshot as any).url = '/share/test';

		const shareLinksService = TestBed.inject(ShareLinksService);
		spyOn(shareLinksService, 'isUnlistedShare').and.returnValue(
			Promise.resolve(false),
		);
		component.item.isRecord = true;
		component.item.type = 'type.record.image';

		await component.ngOnInit();

		expect(component.recordThumbnailUrl).toBeDefined();
		expect(component.recordThumbnailUrl).toMatch(
			/^assets\/img\/preview\/preview-\d+\.jpg$/,
		);

		(router.routerState.snapshot as any).url = '/';
	});

	it('should not replace the stock preview when a thumbnail arrives later', async () => {
		// ngOnInit runs again below, so tear down the subscription the init in
		// beforeEach left behind and start from a single one, the way a real
		// component instance does.
		component.ngOnDestroy();

		const router = TestBed.inject(Router);
		(router.routerState.snapshot as any).url = '/share/test';

		const shareLinksService = TestBed.inject(ShareLinksService);
		spyOn(shareLinksService, 'isUnlistedShare').and.returnValue(
			Promise.resolve(false),
		);
		component.item.isRecord = true;
		component.item.type = 'type.record.image';

		await component.ngOnInit();

		const stockPreview = component.recordThumbnailUrl;

		expect(stockPreview).toMatch(/^assets\/img\/preview\/preview-\d+\.jpg$/);

		component.item.thumbURL200 = 'https://example.com/thumb.jpg';
		thumbnailUpdatedSubject.next(component.item);

		expect(component.recordThumbnailUrl).toBe(stockPreview);

		(router.routerState.snapshot as any).url = '/';
	});

	it('should not expose the real thumbnail until the share type is known', async () => {
		const router = TestBed.inject(Router);
		(router.routerState.snapshot as any).url = '/share/test';

		const shareLinksService = TestBed.inject(ShareLinksService);
		let resolveIsUnlistedShare: (isUnlisted: boolean) => void = () => {};
		spyOn(shareLinksService, 'isUnlistedShare').and.returnValue(
			new Promise<boolean>((resolve) => {
				resolveIsUnlistedShare = resolve;
			}),
		);
		component.item.isRecord = true;
		component.item.type = 'type.record.image';
		component.item.thumbURL200 = 'https://example.com/thumb.jpg';

		// Deliberately not awaited: a listed share must not show the real
		// thumbnail in the window before isUnlistedShare() settles.
		const init = component.ngOnInit();

		expect(component.recordThumbnailUrl).toBeUndefined();

		resolveIsUnlistedShare(false);
		await init;

		expect(component.recordThumbnailUrl).toMatch(
			/^assets\/img\/preview\/preview-\d+\.jpg$/,
		);

		(router.routerState.snapshot as any).url = '/';
	});

	it('should show the real thumbnail on an unlisted share', async () => {
		const router = TestBed.inject(Router);
		(router.routerState.snapshot as any).url = '/share/test';

		const shareLinksService = TestBed.inject(ShareLinksService);
		spyOn(shareLinksService, 'isUnlistedShare').and.returnValue(
			Promise.resolve(true),
		);
		component.item.isRecord = true;
		component.item.type = 'type.record.image';
		component.item.thumbURL200 = 'https://example.com/thumb.jpg';

		await component.ngOnInit();

		expect(component.recordThumbnailUrl).toBe('https://example.com/thumb.jpg');

		(router.routerState.snapshot as any).url = '/';
	});

	it('should always set real thumbnail URL on init', async () => {
		component.item.isRecord = true;
		component.item.type = 'type.record.image';
		component.item.thumbURL200 = 'https://example.com/thumb.jpg';

		await component.ngOnInit();

		expect(component.recordThumbnailUrl).toBe('https://example.com/thumb.jpg');
	});

	it('should set the real thumbnail without waiting outside a share preview', async () => {
		component.ngOnDestroy();
		component.item.isRecord = true;
		component.item.type = 'type.record.image';
		component.item.thumbURL200 = 'https://example.com/thumb.jpg';

		// Deliberately not awaited: outside a share preview there is no share type
		// to wait for, so the thumbnail belongs to the first render.
		const init = component.ngOnInit();

		expect(component.recordThumbnailUrl).toBe('https://example.com/thumb.jpg');

		await init;
	});

	it('should pick up a thumbnail added to the item after init', async () => {
		component.ngOnDestroy();
		component.item.isRecord = true;
		component.item.type = 'type.record.image';

		await component.ngOnInit();

		expect(component.recordThumbnailUrl).toBeUndefined();

		// The thumbnail refresh poll in DataService mutates the existing item
		// rather than replacing it, then announces the item it wrote to.
		component.item.thumbnail256 = 'https://example.com/256';
		thumbnailUpdatedSubject.next(component.item);

		expect(component.recordThumbnailUrl).toBe('https://example.com/256');
	});

	it('should ignore a thumbnail update for a different item', async () => {
		component.ngOnDestroy();
		component.item.isRecord = true;
		component.item.type = 'type.record.image';

		await component.ngOnInit();

		component.item.thumbnail256 = 'https://example.com/256';
		// Same folder_linkId, different instance: only the item this row renders
		// counts, so the update belongs to some other row.
		thumbnailUpdatedSubject.next({
			folder_linkId: component.item.folder_linkId,
			thumbnail256: 'https://example.com/other',
		});

		expect(component.recordThumbnailUrl).toBeUndefined();
	});

	it('should stop applying thumbnail updates once destroyed', async () => {
		component.ngOnDestroy();
		component.item.isRecord = true;
		component.item.type = 'type.record.image';

		await component.ngOnInit();
		component.ngOnDestroy();

		component.item.thumbnail256 = 'https://example.com/256';
		thumbnailUpdatedSubject.next(component.item);

		expect(component.recordThumbnailUrl).toBeUndefined();
	});

	it('should display displayTime instead of displayDT when displayTime is set', () => {
		component.item.displayTime = '2020-06-10';
		component.item.displayDT = '2023-01-01T00:00:00.000Z';
		fixture.detectChanges();

		const secondRowDate =
			fixture.nativeElement.querySelector('.second-row span')?.textContent;

		expect(secondRowDate).toContain('2020-06-10');
		expect(secondRowDate).not.toContain('2023-01-01');
	});

	it('should display displayDT when displayTime is not set', () => {
		component.item.displayTime = undefined;
		component.item.displayDT = '2023-01-01T00:00:00.000Z';
		fixture.detectChanges();

		const secondRowDate =
			fixture.nativeElement.querySelector('.second-row span')?.textContent;

		expect(secondRowDate).toContain('2023-01-01T00:00:00.000Z');
	});

	it('should display only the start date when displayTime is an EDTF interval', () => {
		component.item.displayTime = '2020-06-10/2026-06-15';
		component.item.displayDT = '2023-01-01T00:00:00.000Z';
		fixture.detectChanges();

		const secondRowDate =
			fixture.nativeElement.querySelector('.second-row span')?.textContent;

		expect(secondRowDate).toContain('2020-06-10');
		expect(secondRowDate).not.toContain('2026-06-15');
		expect(secondRowDate).not.toContain('2023-01-01');
	});

	it('should fall back to displayDT when the EDTF interval has an open start', () => {
		component.item.displayTime = '../2026-06-15';
		component.item.displayDT = '2023-01-01T00:00:00.000Z';
		fixture.detectChanges();

		const secondRowDate =
			fixture.nativeElement.querySelector('.second-row span')?.textContent;

		expect(secondRowDate).toContain('2023-01-01T00:00:00.000Z');
	});

	it('should base the public-archive date on displayTime when it is set', async () => {
		component.item.displayTime = '2020-06-10';
		component.item.displayDT = '2023-01-01T00:00:00.000Z';

		await component.ngOnInit();

		expect(component.date).toContain('2020');
		expect(component.date).not.toContain('2023');
	});

	it('should fall back to displayDT for the public-archive date when displayTime is not set', async () => {
		component.item.displayTime = undefined;
		component.item.displayDT = '2023-03-15T12:00:00.000Z';

		await component.ngOnInit();

		expect(component.date).toContain('2023');
	});

	it('should use the interval start for the public-archive date when displayTime is an EDTF interval', async () => {
		component.item.displayTime = '2020-06-10/2026-06-15';
		component.item.displayDT = '2023-01-01T00:00:00.000Z';

		await component.ngOnInit();

		expect(component.date).toContain('2020');
		expect(component.date).not.toContain('2023');
		expect(component.date).not.toContain('2026');
	});
});

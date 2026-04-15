import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { of } from 'rxjs';
import { ActivatedRoute, provideRouter } from '@angular/router';

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

import { vi } from 'vitest';

@Pipe({ name: 'itemTypeIcon' })
class MockItemTypeIconPipe implements PipeTransform {
	transform(value: any): any {
		return value;
	}
}

@Pipe({ name: 'prDate' })
export class MockPrDatePipe implements PipeTransform {
	transform(value: any, format?: string): string {
		return `mocked-date${format ? `-${format}` : ''}`;
	}
}

@Pipe({ name: 'prConstants' })
export class MockPrConstantsPipe implements PipeTransform {
	transform(value: string): string {
		return `mocked-${value}`;
	}
}

@Pipe({ name: 'prTooltip' })
export class MockPrTooltipPipe implements PipeTransform {
	transform(value: string): string {
		return value;
	}
}

describe('FileListItemComponent', () => {
	let component: FileListItemComponent;
	let fixture: ComponentFixture<FileListItemComponent>;
	let editService: EditService;

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
		moveItems: vi.fn().mockReturnValue(Promise.resolve()),
		updateItems: vi.fn().mockReturnValue(Promise.resolve()),
	};

	const mockDeviceService = {
		isMobileWidth: vi.fn().mockReturnValue(false),
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MockItemTypeIconPipe, MockPrDatePipe, MockPrConstantsPipe, MockPrTooltipPipe],
			declarations: [FileListItemComponent, GetThumbnailPipe],
			providers: [
				provideNoopAnimations(),
				provideRouter([]),
				{ provide: ActivatedRoute, useValue: activatedRouteMock },
				{ provide: ElementRef, useValue: { nativeElement: {} } },
				{
					provide: DataService,
					useValue: {
						registerItem: vi.fn(),
						unregisterItem: vi.fn(),
						getSelectedItems: () => new Map(),
						beginPreparingForNavigate: vi.fn(),
						fetchLeanItems: vi.fn(),
						setItemMultiSelectStatus: vi.fn(),
						currentFolder: { type: '' },
					},
				},
				{
					provide: PromptService,
					useValue: {
						prompt: vi.fn()
							.mockReturnValue(
								Promise.resolve({ displayName: 'Updated Name' }),
							),
						confirm: vi.fn().mockReturnValue(Promise.resolve()),
					},
				},
				{
					provide: ApiService,
					useValue: { folder: { getWithChildren: vi.fn() } },
				},
				{
					provide: MessageService,
					useValue: { showError: vi.fn() },
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
						dispatch: vi.fn(),
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
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(FileListItemComponent);
		component = fixture.componentInstance;
		editService = TestBed.inject(EditService);

		fixture.componentRef.setInput('item', {
			displayDT: new Date().toISOString(),
			displayName: 'Test Item',
			archiveNbr: '123',
			folder_linkId: '456',
			type: '',
			isFolder: false,
			isRecord: false,
			dataStatus: 0,
			isFetching: false,
			update: vi.fn(),
			fetched: Promise.resolve(true),
		} as any);

		fixture.componentRef.setInput('folderView', '' as any);
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

		expect(component.isDragTarget).toBe(true);
	});

	it('should handle drop and confirm move', async () => {
		await component.onDrop({} as any);

		expect(editService.moveItems).toHaveBeenCalled();
	});

	it('should reject drop and show error', async () => {
		editService.moveItems = vi.fn()
			.mockReturnValue(Promise.reject({ getMessage: () => 'Error' }));
		await component.onDrop({} as any).catch(() => {
			expect(TestBed.inject(MessageService).showError).toHaveBeenCalledWith({
				message: 'Error occurred',
			});
		});
	});

	it('should preview unlisted record', () => {
		component.isUnlistedShare = true;
		component.item.isFolder = false;
		vi.spyOn(component, 'goToItem');
		component.onItemClick({} as MouseEvent);

		expect(component.goToItem).toHaveBeenCalled();
	});

	it('should emit itemClicked on mobile or non-selectable', () => {
		component.isUnlistedShare = false;
		component.canSelect = false;
		mockDeviceService.isMobileWidth.mockReturnValue(true);
		vi.spyOn(component.itemClicked, 'emit');
		vi.spyOn(component, 'goToItem');
		component.onItemClick(new MouseEvent('click'));

		expect(component.goToItem).toHaveBeenCalled();
		expect(component.itemClicked.emit).toHaveBeenCalled();
	});

	it('should handle double click and clear timeout', () => {
		(component as any).singleClickTimeout = setTimeout(() => {}, 100);
		vi.spyOn(component, 'goToItem');
		component.onItemDoubleClick();

		expect((component as any).singleClickTimeout).toBeNull();
		expect(component.goToItem).toHaveBeenCalled();
	});

	it('should emit itemClicked on single click', () => new Promise<void>((resolve, reject) => {
		vi.spyOn(component.itemClicked, 'emit');
		component.onItemSingleClick(new MouseEvent('click'));
		setTimeout(() => {
			expect(component.itemClicked.emit).toHaveBeenCalled();
			resolve();
		}, 150);
	}));

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
		vi.spyOn(component, 'onItemClick');
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
		editService.updateItems = vi.fn()
			.mockReturnValue(Promise.reject({ getMessage: () => 'Error' }));
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
		vi.spyOn(component.itemVisible, 'emit');
		component.onIntersection({ target: {} as Element, visible: true });

		expect(component.itemVisible.emit).toHaveBeenCalled();
	});

	it('should toggle hover flags', () => {
		component.onMouseOverName();

		expect(component.isNameHovered).toBe(true);
		component.onMouseLeaveName();

		expect(component.isNameHovered).toBe(false);
	});
});

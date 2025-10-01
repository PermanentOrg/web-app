import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, Pipe, PipeTransform } from '@angular/core';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Deferred } from '@root/vendor/deferred';

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
import { FileListItemComponent } from './file-list-item.component';

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

describe('FileListItemComponent', () => {
	let component: FileListItemComponent;
	let fixture: ComponentFixture<FileListItemComponent>;
	let editService: EditService;

	const mockEditService = {
		moveItems: jasmine.createSpy().and.returnValue(Promise.resolve()),
		updateItems: jasmine.createSpy().and.returnValue(Promise.resolve()),
	};

	const mockDeviceService = {
		isMobileWidth: jasmine.createSpy().and.returnValue(false),
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MockItemTypeIconPipe, MockPrDatePipe, MockPrConstantsPipe],
			declarations: [FileListItemComponent],
			providers: [
				provideNoopAnimations(),
				provideRouter([]),
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

		expect(TestBed.inject(DataService).unregisterItem).toHaveBeenCalledWith(
			component.item,
		);
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
		component.showUnlistedPreview();

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
		const deferred = new Deferred();
		component.item.displayName = 'Same';
		component.saveUpdates({ displayName: 'Same' }, deferred);
		deferred.promise.then(() => {
			expect(component.item.update).not.toHaveBeenCalled();
		});
	});

	it('should reject update and restore original data', async () => {
		const deferred = new Deferred();
		editService.updateItems = jasmine
			.createSpy()
			.and.returnValue(Promise.reject({ getMessage: () => 'Error' }));
		await component.saveUpdates({ displayName: 'New' }, deferred).catch(() => {
			expect(component.item.update).toHaveBeenCalledWith({
				displayName: 'Test Item',
			});

			expect(TestBed.inject(MessageService).showError).toHaveBeenCalled();
		});
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
});

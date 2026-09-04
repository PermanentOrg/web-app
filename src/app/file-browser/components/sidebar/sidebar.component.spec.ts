import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataService } from '@shared/services/data/data.service';
import { EditService } from '@core/services/edit/edit.service';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO, FolderVO, RecordVO } from '@models/index';
import { GetThumbnailPipe } from '@shared/pipes/get-thumbnail.pipe';
import { BehaviorSubject, Subject } from 'rxjs';
import { DateTimeModel } from '@shared/services/edtf-service/edtf.service';
import { MessageService } from '@shared/services/message/message.service';
import { FeatureFlagService } from '@root/app/feature-flag/services/feature-flag.service';
import { EdtfService } from '@shared/services/edtf-service/edtf.service';
import { EditDateTimeModalService } from '../edit-date-time-modal/edit-date-time-modal.service';
import { SidebarComponent } from './sidebar.component';

@Pipe({ name: 'prTooltip', standalone: false })
class MockPrTooltipPipe implements PipeTransform {
	transform(value: any): any {
		return value;
	}
}

@Pipe({ name: 'prConstants', standalone: false })
class MockPrConstantsPipe implements PipeTransform {
	transform(value: any): any {
		return value;
	}
}

@Pipe({ name: 'getAltText', standalone: false })
class MockGetAltTextPipe implements PipeTransform {
	transform(value: any): string {
		return value?.displayName || '';
	}
}

@Pipe({ name: 'prDate', standalone: false })
class MockPrDatePipe implements PipeTransform {
	transform(value: any): string {
		return value?.toString() || '';
	}
}

@Pipe({ name: 'prLocation', standalone: false })
class MockPrLocationPipe implements PipeTransform {
	transform(value: any): string {
		return value || '';
	}
}

@Pipe({ name: 'asRecord', standalone: false })
class MockAsRecordPipe implements PipeTransform {
	transform(value: any): any {
		return value;
	}
}

@Pipe({ name: 'asFolder', standalone: false })
class MockAsFolderPipe implements PipeTransform {
	transform(value: any): any {
		return value;
	}
}

@Pipe({ name: 'dsFileSize', standalone: false })
class MockDsFileSizePipe implements PipeTransform {
	transform(value: any): string {
		return value?.toString() || '';
	}
}

@Pipe({ name: 'folderContents', standalone: false })
class MockFolderContentsPipe implements PipeTransform {
	transform(value: any): string {
		return '';
	}
}

@Pipe({ name: 'isPublicItem', standalone: false })
class MockIsPublicItemPipe implements PipeTransform {
	transform(value: any): boolean {
		return false;
	}
}

@Pipe({ name: 'originalFileExtension', standalone: false })
class MockOriginalFileExtensionPipe implements PipeTransform {
	transform(value: any): string {
		return '';
	}
}

@Pipe({ name: 'selectedItem', standalone: false })
class MockSelectedItemPipe implements PipeTransform {
	transform(value: any): any {
		return value;
	}
}

let selectedItemsSubject: BehaviorSubject<Set<any>>;

const mockDataService = {
	selectedItems$: () => selectedItemsSubject.asObservable(),
	fetchFullItems: (_: any) => {},
	currentFolder: {
		type: 'folder',
	},
};

const mockEditService = {
	openLocationDialog: (_: any) => {},
	openCoordinateDialog: (_: any) => {},
	saveItemVoProperty: (_item: any, _prop: any, _value: any) => {},
};

let closedSubject: Subject<DateTimeModel | undefined>;

const mockModalService = {
	open: (_data: DateTimeModel) => ({
		closed: closedSubject.asObservable(),
	}),
};

class MockAccountService {
	getArchive() {
		return new ArchiveVO({});
	}
	checkMinimumArchiveAccess() {
		return true;
	}
	checkMinimumAccess() {
		return true;
	}
}

let enabledFlags: string[] = [];

const mockFeatureFlagService = {
	isEnabled: (flag: string) => enabledFlags.includes(flag),
};

describe('SidebarComponent', () => {
	let component: SidebarComponent;
	let fixture: ComponentFixture<SidebarComponent>;

	beforeEach(async () => {
		enabledFlags = [];
		closedSubject = new Subject<DateTimeModel | undefined>();

		selectedItemsSubject = new BehaviorSubject<Set<any>>(
			new Set([
				new RecordVO({
					accessRole: 'access.role.owner',
				}),
			]),
		);

		await TestBed.configureTestingModule({
			declarations: [
				SidebarComponent,
				MockPrTooltipPipe,
				MockPrConstantsPipe,
				MockGetAltTextPipe,
				MockPrDatePipe,
				MockPrLocationPipe,
				MockAsRecordPipe,
				MockAsFolderPipe,
				MockDsFileSizePipe,
				MockFolderContentsPipe,
				MockIsPublicItemPipe,
				MockOriginalFileExtensionPipe,
				MockSelectedItemPipe,
				GetThumbnailPipe,
			],
			providers: [
				{
					provide: DataService,
					useValue: mockDataService,
				},
				{
					provide: EditService,
					useValue: mockEditService,
				},
				{
					provide: AccountService,
					useClass: MockAccountService,
				},
				{
					provide: EditDateTimeModalService,
					useValue: mockModalService,
				},
				{
					provide: MessageService,
					useValue: {
						showError: () => {},
						showMessage: () => {},
					},
				},
				{
					provide: FeatureFlagService,
					useValue: mockFeatureFlagService,
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(SidebarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should open location dialog on Enter key press if editable', () => {
		const locationDialogSpy = spyOn(
			mockEditService,
			'openLocationDialog',
		).and.callThrough();

		component.onMapPreviewEnterPress(
			new KeyboardEvent('keydown', { key: 'Enter' }),
		);

		expect(locationDialogSpy).toHaveBeenCalledWith(component.selectedItem);
	});

	it('should set currentTab correctly when setCurrentTab is called', () => {
		component.setCurrentTab('info');
		fixture.detectChanges();

		expect(component.currentTab).toBe('info');

		component.isRootFolder = false;
		component.isPublicItem = false;
		component.setCurrentTab('sharing');
		fixture.detectChanges();

		expect(component.currentTab).toBe('sharing');
	});

	it('should call editService.openLocationDialog when onLocationClick is called if editable', () => {
		const editService = TestBed.inject(EditService);
		spyOn(editService, 'openLocationDialog');

		component.canEdit = true;
		component.selectedItem = new RecordVO({});

		component.onLocationClick();

		expect(editService.openLocationDialog).toHaveBeenCalledWith(
			component.selectedItem,
		);
	});

	it('should correctly update canEdit and canShare when checkPermissions is called', () => {
		component.selectedItem = new RecordVO({
			accessRole: 'access.role.editor',
		});
		component.selectedItems = [component.selectedItem];
		component.isRootFolder = false;
		component.isPublicItem = false;

		component.checkPermissions();

		expect(component.canEdit).toBe(true);
		expect(component.canShare).toBe(true);

		component.selectedItem = new RecordVO({
			accessRole: 'access.role.viewer',
		});
		component.selectedItems = [component.selectedItem];
		component.isRootFolder = false;
		component.isPublicItem = false;

		component.checkPermissions();

		expect(component.canEdit).toBe(false);
		expect(component.canShare).toBe(true);
	});

	it('should prefer displayTime over displayDT when both are set', () => {
		component.selectedItem = new RecordVO({
			accessRole: 'access.role.owner',
			displayTime: '1985-05-20',
			displayDT: '1985-05-20T00:00:00',
		});

		const displayValue =
			component.selectedItem.displayTime || component.selectedItem.displayDT;

		expect(displayValue).toBe('1985-05-20');
	});

	it('should fall back to displayDT when displayTime is not set', () => {
		component.selectedItem = new RecordVO({
			accessRole: 'access.role.owner',
			displayDT: '2024-01-01T00:00:00',
		});

		const displayValue =
			component.selectedItem.displayTime || component.selectedItem.displayDT;

		expect(displayValue).toBe('2024-01-01T00:00:00.000Z');
	});

	describe('edtf-date feature flag', () => {
		it('should set showEdtfDatePicker to false when edtf-date flag is disabled', () => {
			expect(component.showEdtfDatePicker).toBe(false);
		});

		it('should set showEdtfDatePicker to true when edtf-date flag is enabled', () => {
			spyOn(mockFeatureFlagService, 'isEnabled').and.callFake(
				(flag: string) => flag === 'edtf-date',
			);

			const enabledFixture = TestBed.createComponent(SidebarComponent);
			enabledFixture.detectChanges();

			expect(enabledFixture.componentInstance.showEdtfDatePicker).toBe(true);
		});
	});

	it('should hide the original format for folders', () => {
		component.isRecord = false;

		fixture.detectChanges();

		const unknownTypeContainer =
			fixture.nativeElement.querySelector('.unknown');

		expect(unknownTypeContainer).toBeFalsy();
	});

	describe('displayTime getter', () => {
		it('should return empty string when selectedItem is null', () => {
			component.selectedItem = null;

			expect(component.displayTime).toBe('');
		});

		it('should return displayDT when displayTime property does not exist', () => {
			component.selectedItem = new RecordVO({
				displayDT: '1985-05-20T00:00:00Z',
			});

			expect(component.displayTime).toBe('1985-05-20T00:00:00Z');
		});

		it('should parse start date from EDTF interval', () => {
			const item = new RecordVO({ displayTime: '1985-05-20/1990-06-15' });
			component.selectedItem = item;

			expect(component.displayTime).toBe('1985-05-20');
		});

		it('should return full displayTime when no interval separator', () => {
			const item = new RecordVO({ displayTime: '1985-05-20' });
			component.selectedItem = item;

			expect(component.displayTime).toBe('1985-05-20');
		});
	});

	describe('displayEndTime getter', () => {
		it('should return displayEndDT when displayTime property does not exist', () => {
			component.selectedItem = new RecordVO({
				displayEndDT: '1990-06-15T00:00:00Z',
			});

			expect(component.displayEndTime).toBe('1990-06-15T00:00:00Z');
		});

		it('should parse end date from EDTF interval', () => {
			const item = new RecordVO({ displayTime: '1985-05-20/1990-06-15' });
			component.selectedItem = item;

			expect(component.displayEndTime).toBe('1990-06-15');
		});

		it('should return empty string when displayTime has no interval', () => {
			const item = new RecordVO({ displayTime: '1985-05-20' });
			component.selectedItem = item;

			expect(component.displayEndTime).toBe('');
		});

		it('should return empty string when displayTime interval has no end date', () => {
			const item = new RecordVO({ displayTime: '1985-05-20/' });
			component.selectedItem = item;

			expect(component.displayEndTime).toBe('');
		});
	});

	describe('onDateEditing', () => {
		let saveItemVoPropertySpy: jasmine.Spy;

		beforeEach(() => {
			saveItemVoPropertySpy = spyOn(mockEditService, 'saveItemVoProperty');
		});

		it('should build EDTF interval when setting start date and end date exists', async () => {
			const item = new RecordVO({ displayTime: '1985-05-20/1990-06-15' });
			component.selectedItem = item;

			await component.onDateEditing('start', '2000-01-01');

			expect(saveItemVoPropertySpy).toHaveBeenCalledWith(
				item,
				'displayTime',
				'2000-01-01/1990-06-15',
			);
		});

		it('should build EDTF interval when setting end date and start date exists', async () => {
			const item = new RecordVO({ displayTime: '1985-05-20' });
			component.selectedItem = item;

			await component.onDateEditing('end', '2025-12-31');

			expect(saveItemVoPropertySpy).toHaveBeenCalledWith(
				item,
				'displayTime',
				'1985-05-20/2025-12-31',
			);
		});

		it('should set only start date when no end date is provided', async () => {
			const item = new RecordVO({ displayTime: '1985-05-20' });
			component.selectedItem = item;

			await component.onDateEditing('start', '2000-01-01');

			expect(saveItemVoPropertySpy).toHaveBeenCalledWith(
				item,
				'displayTime',
				'2000-01-01',
			);
		});

		it('should set displayTime to null when start date is cleared', async () => {
			const item = new RecordVO({ displayTime: '1985-05-20/1990-06-15' });
			component.selectedItem = item;

			await component.onDateEditing('start', '');

			expect(saveItemVoPropertySpy).toHaveBeenCalledWith(
				item,
				'displayTime',
				null,
			);
		});

		it('should not call saveItemVoProperty when selectedItem is null', async () => {
			component.selectedItem = null;

			await component.onDateEditing('start', '2000-01-01');

			expect(saveItemVoPropertySpy).not.toHaveBeenCalled();
		});
	});

	describe('displayTimeObject', () => {
		it('should keep a stable reference across reads instead of creating a new object each time', async () => {
			component.selectedItem = new RecordVO({ displayTime: '1985-05-20' });

			await component.onDateSaved({
				date: { year: '1985', month: '05', day: '20' },
				time: { format: 'am' },
			});

			const firstRead = component.displayTimeObject;
			const secondRead = component.displayTimeObject;

			expect(firstRead).not.toBeNull();
			expect(secondRead).toBe(firstRead);
		});

		it('should recompute the display time object when a new date is saved', async () => {
			const editService = TestBed.inject(EditService);
			spyOn(editService, 'saveItemVoProperty').and.callFake(
				async (item: any, prop: any, value: any) => {
					item[prop] = value;
				},
			);

			component.selectedItem = new RecordVO({ displayTime: '1985-05-20' });

			await component.onDateSaved({
				date: { year: '1990', month: '06', day: '15' },
				time: { format: 'am' },
			});

			expect(component.displayTimeObject?.date.year).toBe('1990');
		});

		it('should null the display time object and show one error when parsing fails', async () => {
			const messageService = TestBed.inject(MessageService);
			const showErrorSpy = spyOn(messageService, 'showError');
			const edtfService = TestBed.inject(EdtfService);
			spyOn(edtfService, 'toDateTimeModel').and.throwError('bad date');

			component.selectedItem = new RecordVO({ displayTime: 'not-a-date' });

			await component.onDateSaved({
				date: { year: '1990', month: '06', day: '15' },
				time: { format: 'am' },
			});

			expect(component.displayTimeObject).toBeNull();
			expect(showErrorSpy).toHaveBeenCalledTimes(1);
		});

		it('should recompute the display time object when saving an invalid date fails, so the picker re-syncs to the stored value', async () => {
			const messageService = TestBed.inject(MessageService);
			const showErrorSpy = spyOn(messageService, 'showError');
			const edtfService = TestBed.inject(EdtfService);
			spyOn(edtfService, 'toEdtfDate').and.throwError('invalid date');

			component.selectedItem = new RecordVO({ displayTime: '1985-05-20' });

			await component.onDateSaved({
				date: { year: 'not-a-year' } as never,
				time: { format: 'am' },
			});

			expect(showErrorSpy).toHaveBeenCalledTimes(1);
			expect(component.displayTimeObject?.date.year).toBe('1985');
		});
	});

	describe('onDateMoreOptions', () => {
		it('should open the edit date time modal with provided data', () => {
			const openSpy = spyOn(mockModalService, 'open').and.callThrough();

			const modalData: DateTimeModel = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					format: 'am',
				},
			};

			component.onDateMoreOptions(modalData);

			expect(openSpy).toHaveBeenCalledWith(modalData);
		});

		it('should save displayTime when modal returns a result', () => {
			const saveSpy = spyOn(
				mockEditService,
				'saveItemVoProperty',
			).and.callThrough();

			const modalData: DateTimeModel = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					format: 'am',
				},
			};

			component.onDateMoreOptions(modalData);

			closedSubject.next({
				date: { year: '2000', month: '03', day: '15' },
				time: {
					hours: '10',
					minutes: '30',
					seconds: '00',
					format: 'am',
				},
			});

			expect(saveSpy).toHaveBeenCalledWith(
				component.selectedItem,
				'displayTime',
				jasmine.any(String),
			);
		});

		it('should refresh the cached display time after saving from the modal', async () => {
			spyOn(mockEditService, 'saveItemVoProperty').and.callFake(
				async (item: any, prop: any, value: any) => {
					item[prop] = value;
				},
			);

			component.selectedItem = new RecordVO({ displayTime: '1985-05-20' });

			component.onDateMoreOptions({
				date: { year: '1985', month: '05', day: '20' },
				time: { format: 'am' },
			} as DateTimeModel);

			closedSubject.next({
				date: { year: '2000', month: '03', day: '15' },
				time: { format: 'am' },
			} as DateTimeModel);
			await fixture.whenStable();

			expect(component.displayTimeObject?.date.year).toBe('2000');
		});

		it('should not save when the modal closes after the sidebar is destroyed', () => {
			const saveSpy = spyOn(mockEditService, 'saveItemVoProperty');

			const modalData: DateTimeModel = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					format: 'am',
				},
			};

			component.onDateMoreOptions(modalData);
			component.ngOnDestroy();

			closedSubject.next({
				date: { year: '2000', month: '03', day: '15' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					format: 'am',
				},
			});

			expect(saveSpy).not.toHaveBeenCalled();
		});

		it('should not save when modal is dismissed', () => {
			const saveSpy = spyOn(
				mockEditService,
				'saveItemVoProperty',
			).and.callThrough();

			const modalData: DateTimeModel = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					format: 'am',
				},
			};

			component.onDateMoreOptions(modalData);
			closedSubject.next(undefined);

			expect(saveSpy).not.toHaveBeenCalled();
		});
	});

	describe('current folder full-data fetch', () => {
		const originalCurrentFolder = mockDataService.currentFolder;
		let fetchFullItemsSpy: jasmine.Spy;

		beforeEach(() => {
			fetchFullItemsSpy = spyOn(mockDataService, 'fetchFullItems');
		});

		afterEach(() => {
			mockDataService.currentFolder = originalCurrentFolder;
		});

		it('should not fetch a synthetic root folder that has no folderId', async () => {
			mockDataService.currentFolder = new FolderVO({
				displayName: 'Shares',
				pathAsText: ['Shares'],
				type: 'type.folder.root.share',
				ChildItemVOs: [],
			});

			selectedItemsSubject.next(new Set());
			await fixture.whenStable();

			expect(fetchFullItemsSpy).not.toHaveBeenCalled();
		});

		it('should fetch the current folder when it has a folderId and no displayTime', async () => {
			mockDataService.currentFolder = new FolderVO({
				folderId: 42,
				type: 'type.folder.private',
			});

			selectedItemsSubject.next(new Set());
			await fixture.whenStable();

			expect(fetchFullItemsSpy).toHaveBeenCalledWith([
				mockDataService.currentFolder,
			]);
		});
	});

	describe('the location section', () => {
		const getLocationButtons = (): HTMLButtonElement[] =>
			Array.from(
				fixture.nativeElement.querySelectorAll('.sidebar-location-button'),
			);

		describe('with uncertain locations off', () => {
			it('should offer the one dialog that covers both halves', () => {
				expect(component.showUncertainLocations).toBeFalse();
				expect(getLocationButtons().length).toBe(0);
			});
		});

		describe('with uncertain locations on', () => {
			beforeEach(() => {
				enabledFlags = ['uncertain-locations'];
				fixture = TestBed.createComponent(SidebarComponent);
				component = fixture.componentInstance;
				component.canEdit = true;
				fixture.detectChanges();
			});

			it('should split the coordinates and the address into their own buttons', () => {
				const [coordinates, address] = getLocationButtons();

				expect(getLocationButtons().length).toBe(2);
				expect(coordinates.textContent.trim()).toBe('Add coordinates…');
				expect(address.textContent.trim()).toBe('Add a place or address…');
			});

			it('should open the coordinate dialog from the coordinate button', () => {
				const editService = TestBed.inject(EditService);
				spyOn(editService, 'openCoordinateDialog');

				getLocationButtons()[0].click();

				expect(editService.openCoordinateDialog).toHaveBeenCalledWith(
					component.selectedItem,
				);
			});

			it('should open the address dialog from the address button', () => {
				const editService = TestBed.inject(EditService);
				spyOn(editService, 'openLocationDialog');

				getLocationButtons()[1].click();

				expect(editService.openLocationDialog).toHaveBeenCalledWith(
					component.selectedItem,
				);
			});

			it('should leave both buttons alone when the item is read only', () => {
				component.canEdit = false;
				fixture.detectChanges();

				expect(getLocationButtons().map((button) => button.disabled)).toEqual([
					true,
					true,
				]);
			});

			it('should write the stored pair the way the dialog writes it', () => {
				component.selectedItem = new RecordVO({
					LocnVO: { latitude: 38.70786, longitude: -9.400139 },
				});

				expect(component.coordinateDisplay).toBe(`38°42'28.3" N  9°24'00.5" W`);
			});

			it('should leave the address row empty when only coordinates are stored', () => {
				component.selectedItem = new RecordVO({
					LocnVO: { latitude: 38.70786, longitude: -9.400139 },
				});

				expect(component.addressDisplay).toBeNull();
			});

			it('should hand the address row the address parts on one line', () => {
				component.selectedItem = new RecordVO({
					LocnVO: {
						sublocation: '55 Rue Plumet',
						city: 'Lisbon',
						country: 'Portugal',
					},
				});

				expect(component.addressDisplay).toEqual({
					name: null,
					line: '55 Rue Plumet, Lisbon, Portugal',
				});
			});

			it('should keep the coordinates out of the address row', () => {
				component.selectedItem = new RecordVO({
					LocnVO: {
						country: 'Portugal',
						latitude: 38.70786,
						longitude: -9.400139,
					},
				});

				expect(component.addressDisplay).toEqual({
					name: null,
					line: 'Portugal',
				});
			});

			it('should show a place that has a name and nothing else', () => {
				component.selectedItem = new RecordVO({
					LocnVO: { name: "Grandma's house", latitude: 38.70786 },
				});

				expect(component.addressDisplay).toEqual({
					name: "Grandma's house",
					line: null,
				});
			});

			it('should show a postal code the address dialog collected', () => {
				component.selectedItem = new RecordVO({
					LocnVO: { postalCode: '1200-109' },
				});

				expect(component.addressDisplay).toEqual({
					name: null,
					line: '1200-109',
				});
			});

			it('should hand the template one stable object across checks', () => {
				component.selectedItem = new RecordVO({
					LocnVO: { city: 'Lisbon' },
				});

				expect(component.addressDisplay).toBe(component.addressDisplay);
			});

			it('should send the map preview to the coordinate dialog', () => {
				const editService = TestBed.inject(EditService);
				spyOn(editService, 'openCoordinateDialog');

				component.onMapPreviewClick();

				expect(editService.openCoordinateDialog).toHaveBeenCalledWith(
					component.selectedItem,
				);
			});
		});
	});
});

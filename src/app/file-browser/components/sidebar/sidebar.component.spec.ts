import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataService } from '@shared/services/data/data.service';
import { EditService } from '@core/services/edit/edit.service';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO, RecordVO } from '@models/index';
import { of } from 'rxjs';
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

const mockDataService = {
	selectedItems$: () =>
		of(
			new Set([
				new RecordVO({
					accessRole: 'access.role.owner',
				}),
			]),
		),
	fetchFullItems: (_: any) => {},
	currentFolder: {
		type: 'folder',
	},
};

const mockEditService = {
	openLocationDialog: (_: any) => {},
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

describe('SidebarComponent', () => {
	let component: SidebarComponent;
	let fixture: ComponentFixture<SidebarComponent>;

	beforeEach(async () => {
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

		component.onLocationEnterPress(
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

	it('should hide the original format for folders', () => {
		component.isRecord = false;

		fixture.detectChanges();

		const unknownTypeContainer =
			fixture.nativeElement.querySelector('.unknown');

		expect(unknownTypeContainer).toBeFalsy();
	});
});

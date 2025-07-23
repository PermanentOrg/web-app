/* @format */
import { Shallow } from 'shallow-render';
import { FileBrowserComponentsModule } from '@fileBrowser/file-browser-components.module';
import { DataService } from '@shared/services/data/data.service';
import { EditService } from '@core/services/edit/edit.service';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO, RecordVO } from '@models/index';
import { of } from 'rxjs';
import { RecordCastPipe } from '@shared/pipes/cast.pipe';
import { SidebarComponent } from './sidebar.component';

const mockDataService = {
	selectedItems$: () =>
		of(
			new Set([
				new RecordVO({
					accessRole: 'access.role.owner',
				}),
			]),
		),
	fetchFullItems: (_) => {},
};

const mockEditService = {
	openLocationDialog: (_) => {},
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
	let shallow: Shallow<SidebarComponent>;

	beforeEach(() => {
		shallow = new Shallow(SidebarComponent, FileBrowserComponentsModule)
			.provideMock({
				provide: DataService,
				useValue: mockDataService,
			})
			.provideMock({
				provide: EditService,
				useValue: mockEditService,
			})
			.provideMock({
				provide: AccountService,
				useClass: MockAccountService,
			})
			.dontMock(RecordCastPipe);
	});

	it('should create', async () => {
		const { instance } = await shallow.render();

		expect(instance).toBeTruthy();
	});

	it('should open location dialog on Enter key press if editable', async () => {
		const { instance } = await shallow.render();

		const locationDialogSpy = spyOn(
			mockEditService,
			'openLocationDialog',
		).and.callThrough();

		instance.onLocationEnterPress(
			new KeyboardEvent('keydown', { key: 'Enter' }),
		);

		expect(locationDialogSpy).toHaveBeenCalledWith(instance.selectedItem);
	});

	it('should set currentTab correctly when setCurrentTab is called', async () => {
		const { instance, fixture } = await shallow.render();

		instance.setCurrentTab('info');
		fixture.detectChanges();

		expect(instance.currentTab).toBe('info');

		instance.isRootFolder = false;
		instance.isPublicItem = false;
		instance.setCurrentTab('sharing');
		fixture.detectChanges();

		expect(instance.currentTab).toBe('sharing');
	});

	it('should call editService.openLocationDialog when onLocationClick is called if editable', async () => {
		const { instance, inject } = await shallow.render();
		const editService = inject(EditService);
		spyOn(editService, 'openLocationDialog');

		instance.canEdit = true;
		instance.selectedItem = new RecordVO({});

		instance.onLocationClick();

		expect(editService.openLocationDialog).toHaveBeenCalledWith(
			instance.selectedItem,
		);
	});

	it('should correctly update canEdit and canShare when checkPermissions is called', async () => {
		const { instance } = await shallow.render();

		instance.selectedItem = new RecordVO({
			accessRole: 'access.role.editor',
		});
		instance.selectedItems = [instance.selectedItem];
		instance.isRootFolder = false;
		instance.isPublicItem = false;

		instance.checkPermissions();

		expect(instance.canEdit).toBe(true);
		expect(instance.canShare).toBe(true);

		instance.selectedItem = new RecordVO({
			accessRole: 'access.role.viewer',
		});
		instance.selectedItems = [instance.selectedItem];
		instance.isRootFolder = false;
		instance.isPublicItem = false;

		instance.checkPermissions();

		expect(instance.canEdit).toBe(false);
		expect(instance.canShare).toBe(true);
	});

	it('should hide the original format for folders', async () => {
		const { instance, find, fixture } = await shallow.render();

		instance.isRecord = false;

		fixture.detectChanges();

		const unknownTypeContainer =
			fixture.nativeElement.querySelector('.unknown');

		expect(unknownTypeContainer).toBeFalsy();
	});
});

/* @format */
import { Shallow } from 'shallow-render';
import { FileBrowserComponentsModule } from '@fileBrowser/file-browser-components.module';
import { DataService } from '@shared/services/data/data.service';
import { EditService } from '@core/services/edit/edit.service';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO, RecordVO } from '@models/index';
import { of } from 'rxjs';
import { SidebarComponent } from './sidebar.component';

const itemsArray = [new RecordVO({}), new RecordVO({})];

const mockDataService = {
  selectedItems$: () =>
    of(
      new Set([
        new RecordVO({
          accessRole: 'access.role.owner',
        }),
      ]),
    ),
  fetchFullItems: (itemsArray) => {},
};

const mockEditService = {
  openLocationDialog: (record) => {},
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
      .provide({
        provide: EditService,
        useValue: mockEditService,
      })
      .provideMock({
        provide: AccountService,
        useClass: MockAccountService,
      });
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should open location dialog on Enter key press if editable', async () => {
    const { instance, fixture, inject } = await shallow.render();

    inject(AccountService);

    instance.canEdit = true;
    instance.selectedItem = new RecordVO({
      accessRole: 'access.role.owner',
    });
    instance.selectedItems = [instance.selectedItem];
    fixture.detectChanges();

    const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    instance.onLocationEnterPress(mockEvent);

    expect(mockEditService.openLocationDialog).toHaveBeenCalledWith(
      instance.selectedItem,
    );
  });
});

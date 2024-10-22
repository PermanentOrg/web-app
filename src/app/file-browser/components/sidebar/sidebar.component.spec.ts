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
});

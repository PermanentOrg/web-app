import { Shallow } from 'shallow-render';

import { FileBrowserComponentsModule } from '@fileBrowser/file-browser-components.module';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { EditService } from '@core/services/edit/edit.service';
import { LocationPickerComponent } from './location-picker.component';

(globalThis as any).google = {
  maps: {
    LatLng: class {
      private _lat: number;
      private _lng: number;
      constructor(lat: number, lng: number) {
        this._lat = lat;
        this._lng = lng;
      }
      lat() {
        return this._lat;
      }
      lng() {
        return this._lng;
      }
    },
    places: {
      Autocomplete: class {
        constructor(public input: any) {}
        setFields(_: string[]) {}
        addListener(_: string, cb: () => void) {
          cb(); // immediately invoke the callback for test
        }
        getPlace() {
          return {
            name: 'Mock Place',
            address_components: [],
            geometry: {
              location: {
                lat: () => 12.34,
                lng: () => 56.78,
              },
            },
          };
        }
      },
    },
    Map: class {},
    MapMouseEvent: class {},
  },
};

const mockApiService = {};

describe('LocationPickerComponent', () => {
  let shallow: Shallow<LocationPickerComponent>;
  let instance: LocationPickerComponent;
  let fixture;
  let messageShown = false;
  let mockEditService: jasmine.SpyObj<EditService>;

  beforeEach(async () => {
    mockEditService = jasmine.createSpyObj('EditService', ['updateItems']);
    mockEditService.updateItems.and.resolveTo({});

    shallow = new Shallow(LocationPickerComponent, FileBrowserComponentsModule)
      .mock(ApiService, mockApiService)
      .mock(MessageService, {
        showError: () => {
          messageShown = true;
        },
      })
      .mock(EditService, mockEditService);

    const renderResult = await shallow.render({ detectChanges: false });
    instance = renderResult.instance;
    fixture = renderResult.fixture;

    instance.map = {
      panTo: () => {},
    } as any;

    spyOn(instance, 'onAutocompletePlaceSelect').and.stub();

    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(instance).toBeTruthy();
  });

  it('should update item with current location and call editService.updateItems()', async () => {
    const mockLocation = { latitude: 1, longitude: 2 } as any;

    const mockItem = {
      LocnVO: null,
      locnId: 123,
      update: jasmine.createSpy('update'),
    };

    instance.item = mockItem as any;
    instance.currentLocation = mockLocation;

    await instance.saveItem();

    expect(mockItem.update).toHaveBeenCalledWith({ LocnVO: mockLocation });

    expect(mockEditService.updateItems).toHaveBeenCalled();

    const clonedArg = mockEditService.updateItems.calls.mostRecent().args[0][0];

    expect(clonedArg.locnId).toBeUndefined(); // make sure it was deleted
  });
});

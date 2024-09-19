/* @format */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataService } from '@shared/services/data/data.service';
import { AccountService } from '@shared/services/account/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { DragService } from '@shared/services/drag/drag.service';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { DeviceService } from '@shared/services/device/device.service';
import { EventService } from '@shared/services/event/event.service';
import { of, Subject } from 'rxjs';
import { FolderVO } from '@models/folder-vo';
import { RouterTestingModule } from '@angular/router/testing';
import { CdkPortal } from '@angular/cdk/portal';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { FileListComponent } from './file-list.component';

describe('FileListComponent', () => {
  let component: FileListComponent;
  let fixture: ComponentFixture<FileListComponent>;

  const folderViewServiceMock = {
    folderView: 'List',
    viewChange: new Subject(),
  };

  const dragServiceMock = {
    events: jasmine.createSpy('events').and.returnValue(of({ type: 'start' })),
  };

  const deviceServiceMock = {
    isMobileWidth: jasmine.createSpy('isMobileWidth').and.returnValue(false),
  };

  const accountServiceMock = {
    archiveChange: new Subject(),
  };

  const eventServiceMock = {
    dispatch: jasmine.createSpy('dispatch'),
  };

  const dataServiceMock = {
    setCurrentFolder: jasmine.createSpy('setCurrentFolder'),
    folderUpdate: of(new FolderVO({})),
    selectedItems$: jasmine
      .createSpy('selectedItems$')
      .and.returnValue(of(new Set())),
    multiSelectChange: of(true),
    itemToShow$: jasmine.createSpy('itemToShow$').and.returnValue(of(null)),
    fetchLeanItems: jasmine.createSpy('fetchLeanItems'),
    onSelectEvent: jasmine.createSpy('onSelectEvent'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
    events: new Subject(),
    url: '/folder',
  };

  const routeMock = {
    snapshot: {
      data: {
        currentFolder: new FolderVO({}),
        showSidebar: true,
        fileListCentered: false,
        isPublicArchive: false,
      },
      queryParamMap: {
        has: jasmine.createSpy('has').and.returnValue(false),
        get: jasmine.createSpy('get').and.returnValue(null),
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [FileListComponent, FileListItemComponent, CdkPortal], // Declare child components
      providers: [
        { provide: DataService, useValue: dataServiceMock },
        { provide: AccountService, useValue: accountServiceMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: {} }, // Use empty mock for Location
        { provide: FolderViewService, useValue: folderViewServiceMock },
        { provide: DragService, useValue: dragServiceMock },
        { provide: DeviceService, useValue: deviceServiceMock },
        { provide: EventService, useValue: eventServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});

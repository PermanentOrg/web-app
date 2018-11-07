import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { find, remove } from 'lodash';

import * as Testing from '@root/test/testbedConfig';

import { SharedModule } from '@shared/shared.module';
import { DataService } from '@shared/services/data/data.service';
import { AccountService } from '@shared/services/account/account.service';

import { FolderVO, ArchiveVO } from '@root/app/models';
import { FolderResponse, ShareResponse } from '@shared/services/api/index.repo';
import { cloneDeep  } from 'lodash';

import { SharesComponent } from './shares.component';
import { ShareComponent } from '@shares/components/share/share.component';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { FolderPickerComponent } from '@core/components/folder-picker/folder-picker.component';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';

describe('SharesComponent', () => {
  let component: SharesComponent;
  let fixture: ComponentFixture<SharesComponent>;

  let accountService: AccountService;

  const rootFolderData = require('@root/test/responses/folder.getRoot.success.json');
  const getSharesData = require('@root/test/responses/share.getShares.success.json');

  const shares = new ShareResponse(getSharesData).getShareArchiveVOs();
  const currentArchive = new ArchiveVO({
    archiveId: 8552,
    fullName: 'John Smith'
  });

  async function init(sharesDataOverride ?: any[]) {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    config.imports.push(SharedModule);
    config.declarations.push(SharesComponent);
    config.declarations.push(ShareComponent);
    config.declarations.push(FileListItemComponent);
    config.declarations.push(FolderPickerComponent);
    config.providers.push(DataService);
    config.providers.push(AccountService);
    config.providers.push(FolderPickerService);
    config.providers.push({
      provide: ActivatedRoute,
      useValue: {
        snapshot: {
          data: {
            shares: sharesDataOverride || shares
          }
        }
      }
    });
    await TestBed.configureTestingModule(config).compileComponents();

    const rootFolder = new FolderResponse(rootFolderData).getFolderVO();
    accountService = TestBed.get(AccountService);
    accountService.setRootFolder(rootFolder);
    accountService.setArchive(currentArchive);

    fixture = TestBed.createComponent(SharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterAll(() => {
    accountService.clearAccount();
    accountService.clearArchive();
    accountService.clearRootFolder();
  });

  it('should create', async () => {
    await init();
    expect(component).toBeTruthy();
  });

  it('should separate out shared by me from shared with me', async () => {
    await init();
    const current = find(shares, {archiveId: currentArchive.archiveId}) as ArchiveVO;
    const sharedByMe = current.ItemVOs;
    const sharedWithMe = shares.filter((item) => item.archiveId !== currentArchive.archiveId);

    expect(component.sharedByMe.length).toEqual(sharedByMe.length);
    expect(component.sharedWithMe.length).toEqual(sharedWithMe.length);


  });

  it('should work when shared by me is empty', async () => {
    const sharedByMeEmpty = shares.filter((item) => item.archiveId !== currentArchive.archiveId);
    await init(sharedByMeEmpty);
    expect(component.sharedByMe.length).toBe(0);
  });


  it('should work when shared with me is empty', async () => {
    const sharedWithMeEmpty = shares.filter((item) => item.archiveId === currentArchive.archiveId);
    await init(sharedWithMeEmpty);
    expect(component.sharedWithMe.length).toBe(0);
  });
});

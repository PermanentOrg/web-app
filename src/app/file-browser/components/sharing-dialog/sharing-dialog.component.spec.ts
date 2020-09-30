import { ComponentFixture, fakeAsync, TestBed, TestModuleMetadata, tick } from '@angular/core/testing';
import { SharedModule } from '@shared/shared.module';
import { cloneDeep } from 'lodash';
import * as Testing from '@root/test/testbedConfig';
import { SharingDialogComponent } from './sharing-dialog.component';
import { DialogModule, DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { ArchiveVO, ItemVO, RecordVO, ShareVO } from '@models';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';

const archive1 = new ArchiveVO({
  fullName: 'Mr Archive',
  archiveId: 1
});

const archive2 = new ArchiveVO({
  fullName: 'Archive 2',
  archiveId: 2
});

const shareViewer = new ShareVO({
  ArchiveVO: archive1
});
shareViewer.shareId = 2;
shareViewer.accessRole = 'access.role.viewer';

const shareEditor = new ShareVO({
  ArchiveVO: archive2
});
shareEditor.shareId = 4;
shareEditor.accessRole = 'access.role.editor';

const pendingShare = new ShareVO({
  ArchiveVO: archive2
});
pendingShare.shareId = 59;
pendingShare.accessRole = 'access.role.viewer';
pendingShare.status = 'status.generic.pending';

describe('SharingDialogComponent', () => {
  let component: SharingDialogComponent;
  let fixture: ComponentFixture<SharingDialogComponent>;
  let item: RecordVO;

  let relationUpdateSpy;

  let apiService: ApiService;

  let dialogData: { item: ItemVO };

  beforeEach(async () => {
    item = new RecordVO({
      accessRole: 'access.role.owner',
      displayName: 'shared item',
      ShareVOs: [
      ]
    });

    const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);

    dialogData = {
      item
    };

    const dialogRef = new DialogRef(1, null);

    config.imports.push(SharedModule);
    config.declarations.push(SharingDialogComponent);
    config.providers.push({
      provide: DIALOG_DATA,
      useValue: {
        item
      }
    });
    config.providers.push({
      provide: DialogRef,
      useValue: dialogRef
    });
    await TestBed.configureTestingModule(config).compileComponents();

    relationUpdateSpy = spyOn(TestBed.inject(RelationshipService), 'update')
      .and.returnValue(Promise.resolve());

    apiService = TestBed.inject(ApiService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should exist', () => {
    expect(component).toBeDefined();
  });

  it('should attempt to refresh RelationshipService on creation', () => {
    expect(relationUpdateSpy).toHaveBeenCalled();
  });

  it('should have empty share and pending share lists when share item has none', () => {
    expect(component.shares.length).toBe(0);
    expect(component.pendingShares.length).toBe(0);
  });

  it('should properly separate existing and pending shares', () => {
    component.shareItem = new RecordVO({...item, ShareVOs: [shareViewer, pendingShare]});
    component.ngOnInit();

    expect(component.shares.length).toBe(1);
    expect(component.shares[0].shareId).toBe(shareViewer.shareId);
    expect(component.pendingShares.length).toBe(1);
    expect(component.pendingShares[0].shareId).toBe(pendingShare.shareId);
  });

  it('should add a share to share list upon creation', fakeAsync(() => {
    const shareResponse = new ShareResponse({});
    shareResponse.isSuccessful = true;
    shareResponse.Results = [{
      data: [{
        ShareVO: shareViewer
      }]
    }];

    const apiSpy = spyOn(apiService.share, 'upsert')
      .and.returnValue(Promise.resolve(shareResponse));

    component.onAddArchive(shareViewer.ArchiveVO);
    tick();

    expect(apiSpy).toHaveBeenCalled();
    expect(component.shares.length).toBe(1);
    expect(component.shares[0].shareId).toEqual(shareViewer.shareId);
    expect(component.isArchiveSharedWith(shareViewer.ArchiveVO)).toBeTruthy();
  }));


  it('should add a share request to share list upon approval and sort the list by name', fakeAsync(() => {
    component.shareItem = new RecordVO({...item, ShareVOs: [shareViewer, pendingShare]});
    component.ngOnInit();

    const shareResponse = new ShareResponse({});
    shareResponse.isSuccessful = true;
    shareResponse.Results = [{
      data: [{
        ShareVO: {...pendingShare, status: 'status.generic.ok'}
      }]
    }];

    const apiSpy = spyOn(apiService.share, 'upsert')
      .and.returnValue(Promise.resolve(shareResponse));

    expect(component.pendingShares.length).toBe(1);

    component.approveShare(component.pendingShares[0]);

    tick();
    expect(apiSpy).toHaveBeenCalled();
    expect(component.pendingShares.length).toBe(0);
    expect(component.shares.length).toBe(2);
    expect(component.shares[0].shareId).toEqual(pendingShare.shareId);
    expect(component.shares[1].shareId).toEqual(shareViewer.shareId);
  }));
});

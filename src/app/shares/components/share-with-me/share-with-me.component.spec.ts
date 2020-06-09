// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import * as Testing from '@root/test/testbedConfig';
// import { cloneDeep } from 'lodash';

// import { ShareWithMeComponent } from './share-with-me.component';
// import { SharedModule } from '@shared/shared.module';
// import { FileBrowserModule } from '@fileBrowser/file-browser.module';
// import { DataService } from '@shared/services/data/data.service';
// import { AccountService } from '@shared/services/account/account.service';
// import { TEST_DATA, TEST_DATA_2 } from '@core/core.module.spec';
// import { ShareComponent } from '@shares/components/share/share.component';
// import { ActivatedRoute } from '@angular/router';
// import { ShareResponse } from '@shared/services/api/share.repo';
// import { ArchiveVO } from '@root/app/models';
// import { FolderPickerComponent } from '@core/components/folder-picker/folder-picker.component';
// import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';

// const getSharesData = require('@root/test/responses/share.getShares.success.json');

// const shares = new ShareResponse(getSharesData).getShareArchiveVOs();
// const currentArchive = new ArchiveVO({
//   archiveId: 8552,
//   fullName: 'John Smith'
// });

// describe('ShareWithMeComponent', () => {
//   let component: ShareWithMeComponent;
//   let fixture: ComponentFixture<ShareWithMeComponent>;

//   beforeEach(async(() => {
//     const config = cloneDeep(Testing.BASE_TEST_CONFIG);
//     config.declarations.push(ShareWithMeComponent);
//     config.declarations.push(ShareComponent);
//     config.declarations.push(FolderPickerComponent);

//     config.providers.push(DataService);
//     config.providers.push(FolderPickerService);
//     config.imports.push(SharedModule);
//     config.imports.push(FileBrowserModule);

//     config.providers.push({
//       provide: ActivatedRoute,
//       useValue: {
//         snapshot: {
//           data: {
//             shares: shares
//           }
//         }
//       }
//     });

//     TestBed.configureTestingModule(config)
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     const accountService = TestBed.get(AccountService) as AccountService;
//     accountService.setArchive(currentArchive);

//     fixture = TestBed.createComponent(ShareWithMeComponent);
//     component = fixture.componentInstance as ShareWithMeComponent;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });

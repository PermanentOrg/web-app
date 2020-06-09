// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import * as Testing from '@root/test/testbedConfig';
// import { cloneDeep } from 'lodash';

// import { ShareByMeComponent } from './share-by-me.component';
// import { SharedModule } from '@shared/shared.module';
// import { FileBrowserModule } from '@fileBrowser/file-browser.module';
// import { DataService } from '@shared/services/data/data.service';
// import { AccountService } from '@shared/services/account/account.service';
// import { TEST_DATA } from '@core/core.module.spec';

// describe('ShareByMeComponent', () => {
//   let component: ShareByMeComponent;
//   let fixture: ComponentFixture<ShareByMeComponent>;

//   beforeEach(async(() => {
//     const config = cloneDeep(Testing.BASE_TEST_CONFIG);
//     config.declarations.push(ShareByMeComponent);

//     config.providers.push(DataService);
//     config.imports.push(SharedModule);
//     config.imports.push(FileBrowserModule);

//     TestBed.configureTestingModule(config)
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     const accountService = TestBed.get(AccountService) as AccountService;
//     const currentArchive = TEST_DATA.archive;
//     accountService.setArchive(currentArchive);

//     fixture = TestBed.createComponent(ShareByMeComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });

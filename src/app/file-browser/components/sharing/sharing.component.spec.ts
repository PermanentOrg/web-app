// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import * as Testing from '@root/test/testbedConfig';

// import { SharingComponent } from './sharing.component';
// import { cloneDeep } from 'lodash';
// import { DIALOG_DATA, DialogRef } from '@root/app/dialog/dialog.service';
// import { ShareResponse } from '@shared/services/api/share.repo';
// import { SharedModule } from '@shared/shared.module';
// import { MessageService } from '@shared/services/message/message.service';
// import { PromptService } from '@core/services/prompt/prompt.service';

// const getSharesData = require('@root/test/responses/share.getShares.success.json');

// describe('SharingComponent', () => {
//   let component: SharingComponent;
//   let fixture: ComponentFixture<SharingComponent>;
//   let dialogRef: any;
//   let messageService: MessageService;
//   let promptService: PromptService;

//   const shares = new ShareResponse(getSharesData).getShareArchiveVOs()[0].ItemVOs;

//   async function init(shareItem?: any) {
//     const config = cloneDeep(Testing.BASE_TEST_CONFIG);
//     dialogRef = {
//       id: 0,
//       close: jasmine.createSpy()
//     };

//     config.imports.push(SharedModule);
//     config.declarations.push(SharingComponent);
//     config.providers.push(MessageService);
//     config.providers.push(PromptService);
//     config.providers.push({
//       provide: DIALOG_DATA,
//       useValue: {
//         item: shareItem || shares[0]
//       },
//     });

//     config.providers.push({
//       provide: DialogRef,
//       useValue: dialogRef
//     });

//     await TestBed.configureTestingModule(config).compileComponents();
//     fixture = TestBed.createComponent(SharingComponent);
//     messageService = TestBed.get(MessageService);
//     promptService = TestBed.get(PromptService);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   }

//   it('should create', async () => {
//     await init();
//     expect(component).toBeTruthy();
//   });

//   it('should get the share item', async () => {
//     const shareItem = shares[2];
//     await init(shareItem);
//     expect(component.shareItem).toBe(shareItem);
//   });

//   it('should attempt close the dialog when done button clicked', async () => {
//     await init();
//     component.close();
//     expect(dialogRef.close).toHaveBeenCalledTimes(1);
//   });

//   it('should show a message when an owner is clicked', async () => {
//     const shareItem = shares[1];
//     await init(shareItem);
//     expect(component.shareItem).toBe(shareItem);
//     spyOn(messageService, 'showMessage');
//     component.onShareMemberClick(shareItem.ShareVOs[0]);
//     expect(messageService.showMessage).toHaveBeenCalled();
//   });

//   it('should show a message when a non-owner attempts to edit', async () => {
//     const shareItem = cloneDeep(shares[0]);
//     shareItem.accessRole = 'access.role.viewer';
//     await init(shareItem);
//     expect(component.shareItem).toBe(shareItem);
//     spyOn(messageService, 'showMessage');
//     component.onShareMemberClick(shareItem.ShareVOs[0]);
//     expect(messageService.showMessage).toHaveBeenCalled();
//   });

//   it('should prompt for options when any other member is clicked', async () => {
//     const shareItem = shares[0];
//     await init(shareItem);
//     expect(component.shareItem).toBe(shareItem);
//     spyOn(promptService, 'promptButtons');
//     try {
//       component.onShareMemberClick(shareItem.ShareVOs[0]);
//     } catch (e) {
//       // fails bc it's a spy and there's no componen, suppress the error
//     }
//     expect(promptService.promptButtons).toHaveBeenCalled();
//   });
// });

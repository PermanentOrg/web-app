import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';

import { MainComponent } from '@core/components/main/main.component';
import { NavComponent } from '@core/components/nav/nav.component';
import { LeftMenuComponent } from '@core/components/left-menu/left-menu.component';
import { MessageService } from '@shared/services/message/message.service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { AccountService } from '@shared/services/account/account.service';
import { PromptComponent } from '@core/components/prompt/prompt.component';
import { MessageComponent } from '@shared/components/message/message.component';
import { UploadProgressComponent } from '@core/components/upload-progress/upload-progress.component';
import { RightMenuComponent } from '@core/components/right-menu/right-menu.component';
import { UploadButtonComponent } from '@core/components/upload-button/upload-button.component';
import { SharedModule } from '@shared/shared.module';
import { DataService } from '@shared/services/data/data.service';
import { FolderPickerComponent } from '../folder-picker/folder-picker.component';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { DialogComponent } from '@root/app/dialog/dialog.component';
import { Dialog } from '@root/app/dialog/dialog.service';
import { DialogModule } from '@root/app/dialog/dialog.module';

const defaultAuthData = require('@root/test/responses/auth.login.success.json') as any;

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  let accountService: AccountService;
  let messageService: MessageService;

  async function init(authResponseData = defaultAuthData) {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);

    config.imports.push(SharedModule);
    config.imports.push(DialogModule.forRoot());

    config.declarations.push(MainComponent);
    config.declarations.push(NavComponent);
    config.declarations.push(PromptComponent);
    config.declarations.push(MessageComponent);
    config.declarations.push(LeftMenuComponent);
    config.declarations.push(RightMenuComponent);
    config.declarations.push(UploadProgressComponent);
    config.declarations.push(UploadButtonComponent);
    config.declarations.push(FolderPickerComponent);

    config.providers.push(AccountService);
    config.providers.push(DataService);
    config.providers.push(FolderPickerService);

    await TestBed.configureTestingModule(config).compileComponents();

    const authResponse = new AuthResponse(authResponseData);
    accountService = TestBed.get(AccountService);

    accountService.setAccount(authResponse.getAccountVO());
    accountService.setArchive(authResponse.getArchiveVO());

    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'showMessage');

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    const service = messageService as any;
    if (service && service.calls) {
      (service as any).calls.reset();
    }
  });

  it('should create', async () => {
    await init();
    expect(component).toBeTruthy();
  });

  it('should show a prompt when both email and phone are unverified', async () => {
    const data = require('@root/test/responses/auth.verify.unverifiedBoth.success.json');
    await init(data);
    expect(messageService.showMessage).toHaveBeenCalledTimes(1);
    expect(messageService.showMessage).toHaveBeenCalledWith(
      jasmine.stringMatching('email and phone'),
      'info',
      jasmine.anything(),
      ['/auth/verify'],
      {
        sendEmail: true,
        sendSms: true
      }
    );
  });

  it('should show a prompt when only email is unverified', async () => {
    const data = require('@root/test/responses/auth.verify.unverifiedEmail.success.json');
    await init(data);
    expect(messageService.showMessage).toHaveBeenCalledTimes(1);
    expect(messageService.showMessage).toHaveBeenCalledWith(
      jasmine.stringMatching('email'),
      'info',
      jasmine.anything(),
      ['/auth/verify'],
      {
        sendEmail: true
      }
    );
    expect(messageService.showMessage).not.toHaveBeenCalledWith(
      jasmine.stringMatching('email and phone'),
      jasmine.anything(),
      jasmine.anything(),
      jasmine.anything()
    );
  });

  it('should show a prompt when only phone is unverified', async () => {
    const data = require('@root/test/responses/auth.verify.unverifiedPhone.success.json');
    await init(data);
    expect(messageService.showMessage).toHaveBeenCalledTimes(1);
    expect(messageService.showMessage).toHaveBeenCalledWith(
      jasmine.stringMatching('phone'),
      'info',
      jasmine.anything(),
      ['/auth/verify'],
      {
        sendSms: true
      }
    );
    expect(messageService.showMessage).not.toHaveBeenCalledWith(
      jasmine.stringMatching('email and phone'),
      jasmine.anything(),
      jasmine.anything(),
      jasmine.anything()
    );
  });

  it('should show a prompt when nothing is unverified', async () => {
    const data = require('@root/test/responses/auth.login.success.json');
    await init(data);
    expect(messageService.showMessage).toHaveBeenCalledTimes(0);
  });
});

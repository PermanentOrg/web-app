import { ComponentFixture, TestBed, TestModuleMetadata } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { VerifyComponent } from '@auth/components/verify/verify.component';
import { LogoComponent } from '@auth/components/logo/logo.component';
import { SharedModule } from '@shared/shared.module';
import { AccountService } from '@shared/services/account/account.service';
import { AuthResponse } from '@shared/services/api/index.repo';
import { HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { HttpService } from '@shared/services/http/http.service';
import { ApiService } from '@shared/services/api/api.service';
import { ActivatedRoute } from '@angular/router';

const defaultAuthData = require('@root/test/responses/auth.verify.unverifiedEmail.success.json');

describe('VerifyComponent', () => {
  let component: VerifyComponent;
  let fixture: ComponentFixture<VerifyComponent>;

  let httpMock: HttpTestingController;
  let accountService: AccountService;

  async function init(authResponseData = defaultAuthData, queryParams = {}) {
    const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);

    config.declarations.push(VerifyComponent);

    config.imports.push(SharedModule);

    config.providers.push(HttpService);
    config.providers.push(ApiService);
    config.providers.push(AccountService);
    config.providers.push({
      provide: ActivatedRoute,
      useValue: {
        snapshot: {
          queryParams: queryParams,
          params: {}
        }
      }
    });

    // Define the re-captcha element as a custom element so it's only mocked out
    config.schemas = [CUSTOM_ELEMENTS_SCHEMA];

    await TestBed.configureTestingModule(config).compileComponents();

    httpMock = TestBed.get(HttpTestingController);

    accountService = TestBed.get(AccountService);

    const authResponse = new AuthResponse(authResponseData);

    accountService.setAccount(authResponse.getAccountVO());
    accountService.setArchive(authResponse.getArchiveVO());

    fixture = TestBed.createComponent(VerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    accountService.clear();
    // httpMock.verify();
  });

  it('should create', async () => {
    await init();
    expect(component).toBeTruthy();
  });

  // it('should send email verification if sendEmail flag set', async () => {
  //   await init(defaultAuthData, {sendEmail: true});
  //   const req = httpMock.expectOne(`${environment.apiUrl}/auth/resendMailCreatedAccount`);
  // });

  // it('should send sms verification if sendSms flag set', async () => {
  //   await init(defaultAuthData, {sendSms: true});
  //   const req = httpMock.expectOne(`${environment.apiUrl}/auth/resendTextCreatedAccount`);
  // });

  it('should require only email verification if only email unverified', async () => {
    await init();
    expect(component.verifyingEmail).toBeTruthy();
    expect(component.needsEmail).toBeTruthy();
    expect(component.needsPhone).toBeFalsy();
  });

  it('should require only phone verification if only phone unverified', async () => {
    const unverifiedPhoneData = require('@root/test/responses/auth.verify.unverifiedPhone.success.json');
    await init(unverifiedPhoneData);
    expect(component.verifyingPhone).toBeTruthy();
    expect(component.needsPhone).toBeTruthy();
    expect(component.needsEmail).toBeFalsy();
  });

  it('should require verification of both if both unverified, and verify email first', async () => {
    const unverifiedBothData = require('@root/test/responses/auth.verify.unverifiedBoth.success.json');
    await init(unverifiedBothData);
    expect(component.verifyingEmail).toBeTruthy();
    expect(component.needsPhone).toBeTruthy();
    expect(component.needsEmail).toBeTruthy();
  });

  it('should verify email and then switch to phone verification if needed', async () => {
    const unverifiedBothData = require('@root/test/responses/auth.verify.unverifiedBoth.success.json');
    await init(unverifiedBothData);

    expect(component.verifyingEmail).toBeTruthy();
    expect(component.needsPhone).toBeTruthy();
    expect(component.needsEmail).toBeTruthy();

    component.onSubmit(component.verifyForm.value)
      .then(() => {
        expect(component.waiting).toBeFalsy();
        expect(component.verifyingEmail).toBeFalsy();
        expect(component.needsEmail).toBeFalsy();
        expect(component.needsPhone).toBeTruthy();
        expect(component.verifyingPhone).toBeTruthy();
      });

    expect(component.waiting).toBeTruthy();

    const verifyEmailResponse = require('@root/test/responses/auth.verify.verifyEmailThenPhone.success.json');
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/verify`);
    req.flush(verifyEmailResponse);
  });

  it('should verify email and redirect if only email needed', async () => {
    const unverifiedEmailData = require('@root/test/responses/auth.verify.unverifiedEmail.success.json');
    await init(unverifiedEmailData);

    const finishSpy = spyOn(component, 'finish');

    expect(component.verifyingEmail).toBeTruthy();
    expect(component.needsPhone).toBeFalsy();
    expect(component.needsEmail).toBeTruthy();

    component.onSubmit(component.verifyForm.value)
      .then(() => {
        expect(component.waiting).toBeFalsy();
        expect(component.needsEmail).toBeFalsy();
        expect(component.needsPhone).toBeFalsy();
        expect(finishSpy).toHaveBeenCalled();
      });

    expect(component.waiting).toBeTruthy();

    const verifyEmailResponse = require('@root/test/responses/auth.verify.verifyEmailNoPhone.success.json');
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/verify`);
    req.flush(verifyEmailResponse);
  });

  it('should verify phone and redirect if only phone needed', async () => {
    const unverifiedPhoneData = require('@root/test/responses/auth.verify.unverifiedPhone.success.json');
    await init(unverifiedPhoneData);

    const finishSpy = spyOn(component, 'finish');

    expect(component.verifyingPhone).toBeTruthy();
    expect(component.verifyingEmail).toBeFalsy();
    expect(component.needsPhone).toBeTruthy();
    expect(component.needsEmail).toBeFalsy();

    component.onSubmit(component.verifyForm.value)
      .then(() => {
        expect(component.waiting).toBeFalsy();
        expect(component.needsEmail).toBeFalsy();
        expect(component.needsPhone).toBeFalsy();
        expect(finishSpy).toHaveBeenCalled();
      });

    expect(component.waiting).toBeTruthy();

    const verifyPhoneResponse = require('@root/test/responses/auth.verify.verifyPhone.success.json');
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/verify`);
    req.flush(verifyPhoneResponse);
  });

  it('should show CAPTCHA before verifying phone', async () => {
    const unverifiedPhoneData = require('@root/test/responses/auth.verify.unverifiedPhone.success.json');
    await init(unverifiedPhoneData);

    // Testing environments might not have the site key enabled,
    // so force captchaEnabled to be true.
    component.captchaEnabled = true;
    expect(component.captchaPassed).toBeFalsy();
    expect(component.canSendCodes('phone')).toBeFalsy();

    component.resolveCaptcha('mock-captcha-success');

    expect(component.captchaPassed).toBeTruthy();
    expect(component.canSendCodes('phone')).toBeTruthy();
  });
});

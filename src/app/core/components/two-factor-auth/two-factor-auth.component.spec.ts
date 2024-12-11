/* @format */
import { Shallow } from 'shallow-render';

import { CoreModule } from '@core/core.module';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TwoFactorAuthComponent } from './two-factor-auth.component';

const mockApiService = {
  idpuser: {
    getTwoFactorMethods: () =>
      Promise.resolve([
        { methodId: 'ABCD', value: 'test@example.com', method: 'mail' },
      ]),
    disableTwoFactor: (methodId, code) => Promise.resolve(),
    sendDisableCode: (methodId) => Promise.resolve(),
    sendEnableCode: (method, value) => Promise.resolve(),
    enableTwoFactr: (method, value, code) => Promise.resolve(),
  },
};

describe('TwoFactorAuthComponent', () => {
  let shallow: Shallow<TwoFactorAuthComponent>;
  let messageShown: boolean = false;

  beforeEach(async () => {
    messageShown = false;
    shallow = new Shallow(TwoFactorAuthComponent, CoreModule)
      .mock(MessageService, {
        showError: () => {
          messageShown = true;
        },
      })
      .mock(ApiService, mockApiService)
      .import(HttpClientTestingModule);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should remove method and update form state', async () => {
    const { instance } = await shallow.render();
    const method = {
      methodId: 'email',
      method: 'email',
      value: 'user@example.com',
    };
    instance.removeMethod(method);

    expect(instance.method).toBe('email');
    expect(instance.selectedMethodToDelete).toEqual(method);
    expect(instance.form.get('contactInfo').value).toBe('user@example.com');
  });

  it('should format phone number correctly', async () => {
    const { instance } = await shallow.render();
    instance.method = 'sms';
    instance.formatPhoneNumber('1234567890');

    expect(instance.form.get('contactInfo').value).toBe('(123) 456-7890');
  });

  it('should format phone number with country code correctly', async () => {
    const { instance } = await shallow.render();
    instance.method = 'sms';
    instance.formatPhoneNumber('+12345678900');

    expect(instance.form.get('contactInfo').value).toBe('+1 (234) 567-8900');
  });

  it('should format international phone numbers correctly', async () => {
    const { instance } = await shallow.render();
    instance.method = 'sms';
    instance.formatPhoneNumber('0040123456789');

    expect(instance.form.get('contactInfo').value).toBe('+401 (234) 567-89');
  });

  it('should handle international phone numbers with country code correctly', async () => {
    const { instance } = await shallow.render();
    instance.method = 'sms';
    instance.formatPhoneNumber('+40123456789');

    expect(instance.form.get('contactInfo').value).toBe('+401 (234) 567-89');
  })

  it('should set codeSent to true when sendCode is called', async () => {
    const { instance } = await shallow.render();
    const event = {
      preventDefault: () => {},
    };
    instance.sendCode(event);

    expect(instance.codeSent).toBe(true);
  });

  it('should call submitData with the form value', async () => {
    const { instance } = await shallow.render();
    instance.form.setValue({ code: '1234', contactInfo: 'user@example.com' });

    const submitDataSpy = spyOn(instance, 'submitData').and.callThrough();
    instance.submitData(instance.form.value);

    expect(submitDataSpy).toHaveBeenCalledWith({
      code: '1234',
      contactInfo: 'user@example.com',
    });
  });

  it('should reset component state when cancel is called', async () => {
    const { instance } = await shallow.render();
    instance.cancel();

    expect(instance.method).toBe('');
    expect(instance.selectedMethodToDelete).toBeNull();
    expect(instance.turnOn).toBe(false);
    expect(instance.form.get('contactInfo').value).toBe('');
    expect(instance.form.get('code').value).toBe('');
  });

  it('should display methods correctly in the table', async () => {
    const methods = [
      { methodId: 'email', method: 'email', value: 'janedoe@example.com' },
      { methodId: 'sms', method: 'sms', value: '(123) 456-7890' },
    ];

    const { instance, find, fixture } = await shallow.render();

    instance.methods = methods; // Set the methods directly on the component instance

    fixture.detectChanges();

    const methodRows = find('.method');

    expect(methodRows.length).toBe(methods.length);
    expect(methodRows[0].nativeElement.textContent).toContain('Email');
    expect(methodRows[0].nativeElement.textContent).toContain(
      'janedoe@example.com',
    );

    expect(methodRows[1].nativeElement.textContent).toContain('SMS Text');
    expect(methodRows[1].nativeElement.textContent).toContain('(123) 456-7890');
  });

  it('should display the code input after the code was sent', async () => {
    const { instance, find, fixture } = await shallow.render();

    instance.codeSent = true;
    instance.turnOn = true;
    instance.method = 'sms';
    fixture.detectChanges();

    const codeContaier = find('.code-container');

    expect(codeContaier.length).toBe(1);
  });

  it('should not display the code input if the code was not sent', async () => {
    const { find, instance, fixture } = await shallow.render();

    instance.turnOn = true;
    instance.method = 'sms';
    fixture.detectChanges();

    const codeContainer = find('.code-container');

    expect(codeContainer.length).toBe(0);
  });
});

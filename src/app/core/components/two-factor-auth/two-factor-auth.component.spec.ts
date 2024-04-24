/* @format */
import { Shallow } from 'shallow-render';

import { TwoFactorAuthComponent } from './two-factor-auth.component';
import { CoreModule } from '@core/core.module';
import { MessageService } from '@shared/services/message/message.service';
import { AbstractControl } from '@angular/forms';

describe('TwoFactorAuthComponent', () => {
  let shallow: Shallow<TwoFactorAuthComponent>;
  let messageShown: boolean = false;

  beforeEach(async () => {
    messageShown = false;
    shallow = new Shallow(TwoFactorAuthComponent, CoreModule).mock(
      MessageService,
      {
        showError: () => {
          messageShown = true;
        },
      }
    );

    it('should create', async () => {
      const { instance } = await shallow.render();
      expect(instance).toBeTruthy();
    });

    it('should update validators when method changes', async () => {
      const { instance } = await shallow.render();
      instance.method = 'sms';
      instance.updateContactInfoValidators();

      // Check if SMS validators are correctly set
      const control = instance.form.get('contactInfo');
      expect(control.validator).toBeTruthy();
      const result = control.validator({
        value: '(123) 456 - 7890',
      } as AbstractControl);
      expect(result).toBeNull(); // Indicates valid input
    });

    it('should remove method and update form state', async () => {
      const { instance } = await shallow.render();
      const method = {
        id: 'email',
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

      expect(instance.form.get('contactInfo').value).toBe('(123) - 456 - 7890');
    });

    it('should set codeSent to true when sendCode is called', async () => {
      const { instance } = await shallow.render();
      instance.sendCode();
      expect(instance.codeSent).toBe(true);
    });

    it('should call submitData with the form value', async () => {
      const { instance } = await shallow.render();
      instance.form.setValue({ code: '1234', contactInfo: 'user@example.com' });
      instance.submitData(instance.form.value);

      expect(instance.submitData).toHaveBeenCalledWith({
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
        { id: 'email', method: 'email', value: 'janedoe@example.com' },
        { id: 'sms', method: 'sms', value: '(123) 456-7890' },
      ];

      const { find } = await shallow.render({ bind: { methods } });

      const methodRows = find('.method');
      expect(methodRows.length).toBe(methods.length);

      expect(methodRows[0].nativeElement.textContent).toContain('Email');
      expect(methodRows[0].nativeElement.textContent).toContain(
        'janedoe@example.com'
      );

      expect(methodRows[1].nativeElement.textContent).toContain('SMS Text');
      expect(methodRows[1].nativeElement.textContent).toContain(
        '(123) 456-7890'
      );
    });
  });
});

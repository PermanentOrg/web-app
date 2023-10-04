/* @format */
import { Shallow } from 'shallow-render';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CoreModule } from '@core/core.module';
import { Dialog } from '@root/app/dialog/dialog.service';
import { AccountVO } from '../../../models/account-vo';
import { GiftStorageComponent } from './gift-storage.component';

describe('GiftStorageComponent', () => {
  let shallow: Shallow<GiftStorageComponent>;

  const mockAccount = new AccountVO({ accountId: 1 });

  const mockAccountService = {
    getAccount: jasmine.createSpy('getAccount').and.returnValue({
      mockAccount,
    }),
  };

  beforeEach(() => {
    shallow = new Shallow(GiftStorageComponent, CoreModule)
      .provide([HttpClient, HttpHandler])
      .mock(Dialog, { open: (token, data, options) => Promise.resolve({}) });
  });

  it('should create', async () => {
    const { instance } = await shallow.render(); // Render the component
    expect(instance).toBeTruthy();
  });

  it('enables the "Send Gift Storage" button when the form is valid', async () => {
    const { find, instance, fixture } = await shallow.render();

    instance.availableSpace = '10';

    instance.giftForm.controls.email.setValue('test@example.com');
    instance.giftForm.controls.amount.setValue('1');

    instance.giftForm.updateValueAndValidity();
    fixture.detectChanges();

    const button: HTMLButtonElement = find('.btn-primary').nativeElement;

    expect(button.disabled).toBe(false);
  });

  it('the button is disabled if the email is not valid', async () => {
    const { find, instance, fixture } = await shallow.render();

    instance.availableSpace = '5';

    instance.giftForm.controls.email.setValue('test');
    instance.giftForm.controls.amount.setValue('1');

    instance.giftForm.updateValueAndValidity();
    fixture.detectChanges();

    const button: HTMLButtonElement = find('.btn-primary').nativeElement;

    expect(button.disabled).toBe(true);
  });

  it('calls submitStorageGiftForm when the form is valid', async () => {
    const { instance } = await shallow.render();

    instance.giftForm.controls.email.setValue('test@example.com');
    instance.giftForm.controls.amount.setValue(5);
    instance.giftForm.updateValueAndValidity();

    spyOn(instance, 'submitStorageGiftForm').and.callThrough();

    instance.submitStorageGiftForm(instance.giftForm.value);

    expect(instance.submitStorageGiftForm).toHaveBeenCalledWith({
      email: 'test@example.com',
      amount: 5,
      message: '',
    });
  });
});

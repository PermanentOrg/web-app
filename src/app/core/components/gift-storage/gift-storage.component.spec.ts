/* @format */
import { Shallow } from 'shallow-render';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CoreModule } from '@core/core.module';
import { Dialog } from '@root/app/dialog/dialog.service';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '../../../models/account-vo';
import { GiftStorageComponent } from './gift-storage.component';
import { GiftingResponse } from '@shared/services/api/billing.repo';

describe('GiftStorageComponent', () => {
  let shallow: Shallow<GiftStorageComponent>;

  const mockAccount = new AccountVO({ accountId: 1 });

  const mockAccountService = {
    getAccount: jasmine.createSpy('getAccount').and.returnValue({
      mockAccount,
    }),
    setAccount: jasmine.createSpy('setAccount'),
  };

  beforeEach(() => {
    shallow = new Shallow(GiftStorageComponent, CoreModule)
      .provide([HttpClient, HttpHandler])
      .mock(AccountService, mockAccountService)
      .mock(Dialog, { open: (token, data, options) => Promise.resolve({}) });
  });

  it('should create', async () => {
    const { instance } = await shallow.render(); // Render the component
    expect(instance).toBeTruthy();
  });

  it('enables the "Send Gift Storage" button when the form is valid', async () => {
    const { find, instance, fixture } = await shallow.render();

    instance.availableSpace = '10';

    await instance.giftForm.controls.email.setValue('test@example.com');
    instance.giftForm.controls.amount.setValue('1');

    instance.isAsyncValidating = false;

    instance.giftForm.updateValueAndValidity();
    fixture.detectChanges();
    await fixture.whenStable();

    const button: HTMLButtonElement = find('.btn-primary').nativeElement;

    expect(button.disabled).toBe(false);
  });

  it('disables the submit button if at least one email is not valid', async () => {
    const { find, instance, fixture } = await shallow.render();

    instance.availableSpace = '5';

    instance.giftForm.controls.email.setValue('test@example.com, test');
    instance.giftForm.controls.amount.setValue('1');

    instance.giftForm.updateValueAndValidity();
    fixture.detectChanges();

    const button: HTMLButtonElement = find('.btn-primary').nativeElement;

    expect(button.disabled).toBe(true);
  });

  it('disables the submit button if the there is a duplicate email', async () => {
    const { find, instance, fixture } = await shallow.render();

    instance.availableSpace = '5';

    instance.giftForm.controls.email.setValue(
      'test@example.com, test@example.com'
    );
    instance.giftForm.controls.amount.setValue('1');

    instance.giftForm.updateValueAndValidity();
    fixture.detectChanges();

    const button: HTMLButtonElement = find('.btn-primary').nativeElement;

    expect(button.disabled).toBe(true);
  });

  it('disables the submit button if the amount entered exceeds the available amount', async () => {
    const { find, instance, fixture } = await shallow.render();

    instance.availableSpace = '5';

    await instance.giftForm.controls.email.setValue('test@example.com');
    instance.giftForm.controls.amount.setValue('10');

    instance.giftForm.updateValueAndValidity();

    fixture.detectChanges();
    await fixture.whenStable();

    const button: HTMLButtonElement = find('.btn-primary').nativeElement;

    expect(button.disabled).toBe(true);
  });

  it('displays the total amount gifted based on the number of emails', async () => {
    const { instance, fixture } = await shallow.render();

    instance.availableSpace = '5';

    await instance.giftForm.controls.email.setValue(
      'test@example.com,test1@example.com'
    );
    instance.giftForm.controls.amount.setValue('2');

    instance.giftForm.updateValueAndValidity();

    fixture.detectChanges();
    await fixture.whenStable();

    expect(instance.successMessage).toEqual('Total gifted storage: 4 GB');
  });

  it('disables the submit button if the amount multiplied by the number of emails exceeds the available amount', async () => {
    const { find, instance, fixture } = await shallow.render();

    instance.availableSpace = '5';

    await instance.giftForm.controls.email.setValue(
      'test@example.com,test1@example.com'
    );
    instance.giftForm.controls.amount.setValue('4');

    instance.giftForm.updateValueAndValidity();

    fixture.detectChanges();
    await fixture.whenStable();

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
  it('updates account details upon successful gift operation', async () => {
    const { instance } = await shallow.render();

    instance.availableSpace = '100';

    instance.giftForm.controls.email.setValue('test@example.com');
    instance.giftForm.controls.amount.setValue('50');

    instance.giftResult.next({
      isSuccessful: true,
      response: new GiftingResponse({}),
    });

    expect(mockAccountService.setAccount).toHaveBeenCalled();
    expect(instance.availableSpace).toBe('50.00');
  });
  it('parses the email string correctly', async () => {
    const { instance } = await shallow.render();

    const result = instance.parseEmailString(
      'test@example.com, test1@example.com'
    );

    expect(result).toEqual(['test@example.com', 'test1@example.com']);
  });

  it('returns all the duplicate emails', async (done) => {
    const { instance } = await shallow.render();

    const testEmailString =
      'test@example.com,test@example.com,test2@example.com';
    const expectedDuplicates = ['test@example.com'];

    instance
      .checkForDuplicateEmails(testEmailString)
      .subscribe((duplicates) => {
        expect(duplicates).toEqual(expectedDuplicates);
        done();
      });
  });
});

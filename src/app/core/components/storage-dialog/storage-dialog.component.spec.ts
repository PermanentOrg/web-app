/* @format */
import { Shallow } from 'shallow-render';
import { BillingResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';
import { CoreModule } from '@core/core.module';
import { DialogRef } from '@root/app/dialog/dialog.service';
import { PromoVOData } from '../../../models/promo-vo';
import { ApiService } from '../../../shared/services/api/api.service';
import { AccountVO } from '../../../models/account-vo';
import { MessageService } from '../../../shared/services/message/message.service';
import { StorageDialogComponent } from './storage-dialog.component';

const mockPromoData = {
  Results: [
    {
      data: [
        {
          PromoVO: {
            promoId: 13,
            code: 'promo9',
            sizeInMB: 5000,
          },
        },
      ],
    },
  ],
  isSuccessful: true,
};

const mockApiService = {
  billing: {
    redeemPromoCode: (value: PromoVOData): Promise<BillingResponse> => {
      return Promise.resolve(new BillingResponse(mockPromoData));
    },
  },
};

const mockAccountService = {
  refreshAccount: (): Promise<void> => {
    return Promise.resolve();
  },
  setAccount: (account: AccountVO): void => {},
  getAccount: (): AccountVO => {
    return new AccountVO({ spaceLeft: 10000, spaceTotal: 10000 });
  },
};

describe('StorageDialogComponent', () => {
  let shallow: Shallow<StorageDialogComponent>;
  let messageShown: boolean = false;
  const dialogRef = new DialogRef(1, null);

  beforeEach(() => {
    shallow = new Shallow(StorageDialogComponent, CoreModule)
      .mock(ApiService, mockApiService)
      .mock(DialogRef, dialogRef)
      .mock(AccountService, mockAccountService)
      .mock(MessageService, {
        showError: () => {
          messageShown = true;
        },
      });
  });

  it('should exist', async () => {
    const { element } = await shallow.render();
    expect(element).not.toBeNull();
  });

  it('should return the correct size in MB', async () => {
    const { inject } = await shallow.render();
    const apiService = inject(ApiService);
    const accountService = inject(AccountService);
    const account = new AccountVO({ spaceLeft: 10000, spaceTotal: 10000 });
    accountService.setAccount(account);
    const promoVOData: PromoVOData = { code: 'promo4' };
    const response = await apiService.billing.redeemPromoCode(promoVOData);
    expect(response.getPromoVO().sizeInMB).toBe(5000);
  });

  it('should update the account after submititng the form ', async () => {
    const { instance } = await shallow.render();

    const redeemPromoCodeSpy = spyOn(
      mockApiService.billing,
      'redeemPromoCode'
    ).and.resolveTo(new BillingResponse(mockPromoData));
    const spyRefreshAccount = spyOn(
      mockAccountService,
      'refreshAccount'
    ).and.resolveTo(undefined);
    const updateStorageAfterRedeemingSpy = spyOn(
      instance,
      'updateStorageAfterRedeeming'
    ).and.callThrough();

    const promoData: PromoVOData = { code: 'promo' };

    await instance.onPromoFormSubmit(promoData);

    expect(redeemPromoCodeSpy).toHaveBeenCalled();

    const response = await redeemPromoCodeSpy.calls.mostRecent().returnValue;
    const promo = response.getPromoVO();

    expect(updateStorageAfterRedeemingSpy).toHaveBeenCalledWith(
      promo.sizeInMB * 1024 * 1024
    );
  });

  it('should enable the button after adding a promo code',async() => {
    const { find, instance, fixture } = await shallow.render();

    instance.promoForm.patchValue({
      code: 'promo1',
    });

    instance.promoForm.updateValueAndValidity();
    instance.activeTab = 'promo'

    fixture.detectChanges();

    const button = find('.btn-primary');

    expect(button.nativeElement.disabled).toBeFalsy();
  })
});

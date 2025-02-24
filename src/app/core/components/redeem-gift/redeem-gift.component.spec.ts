/* @format */
import { Shallow } from 'shallow-render';
import { AccountService } from '@shared/services/account/account.service';
import { CoreModule } from '@core/core.module';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { PromoVOData } from '../../../models/promo-vo';
import { ApiService } from '../../../shared/services/api/api.service';
import { MessageService } from '../../../shared/services/message/message.service';
import { RedeemGiftComponent } from './redeem-gift.component';
import {
  MockAccountService,
  MockApiService,
  MockBillingRepo,
} from './shared-mocks';

describe('StorageDialogComponent', () => {
  let shallow: Shallow<RedeemGiftComponent>;
  let messageShown: boolean = false;
  let mockAccountService: MockAccountService;
  let mockApiService: MockApiService;
  let mockActivatedRoute;
  const paramMap = new BehaviorSubject(convertToParamMap({}));
  const queryParamMap = new BehaviorSubject(convertToParamMap({}));

  beforeEach(() => {
    mockActivatedRoute = {
      paramMap: paramMap.asObservable(),
      queryParamMap: queryParamMap.asObservable(),
    };
    mockAccountService = new MockAccountService();
    mockApiService = {
      billing: new MockBillingRepo(),
    };
    shallow = new Shallow(RedeemGiftComponent, CoreModule)
      .dontMock(AccountService)
      .dontMock(ApiService)
      .mock(MessageService, {
        showError: () => {
          messageShown = true;
        },
      })
      .provide({ provide: AccountService, useValue: mockAccountService })
      .provide({ provide: ApiService, useValue: mockApiService })
      .provideMock([{ provide: ActivatedRoute, useValue: mockActivatedRoute }]);
  });

  it('should exist', async () => {
    const { element } = await shallow.render();

    expect(element).not.toBeNull();
  });

  it('has an input for a prefilled promo code', async () => {
    const { find } = await shallow.render({
      bind: {
        promoCode: 'potato',
      },
    });

    expect(find('input').nativeElement.value).toBe('potato');
  });

  it('should send an API request when submitting a promo code', async () => {
    const { instance } = await shallow.render();
    const promoData: PromoVOData = { code: 'promo' };
    await instance.onPromoFormSubmit(promoData);

    expect(mockApiService.billing.calledRedeemPromoCode).toBeTruthy();
    expect(instance.resultMessage.successful).toBeTrue();
  });

  it('should update the account after redeeming a promo code', async () => {
    const { instance } = await shallow.render();
    const promoData: PromoVOData = { code: 'promo' };
    await instance.onPromoFormSubmit(promoData);

    expect(mockAccountService.addedStorage).toBe(5000 * 1024 * 1024);
    expect(instance.resultMessage.successful).toBeTrue();
  });

  it('should enable the submit button after adding a promo code', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.promoForm.patchValue({
      code: 'promo1',
    });
    instance.promoForm.updateValueAndValidity();
    fixture.detectChanges();
    const button = find('.btn-primary');

    expect(button.nativeElement.disabled).toBeFalsy();
  });

  it('should handle an invalid promo code', async () => {
    const { instance } = await shallow.render();
    mockApiService.billing.isSuccessful = false;
    await instance.onPromoFormSubmit({ code: 'potato' });

    expect(instance.resultMessage.successful).toBeFalse();
    expect(instance.resultMessage.message).toBe(
      'There was an error redeeming your code.',
    );
  });

  it('should handle any other unexpected errors when redeeming promo code', async () => {
    const { instance } = await shallow.render();
    mockAccountService.failRefresh = true;
    await instance.onPromoFormSubmit({ code: 'potato' });

    expect(instance.resultMessage.successful).toBeFalse();
  });

  it('should not bump up account storage if it has already been done on the server side', async () => {
    const { instance } = await shallow.render();
    mockAccountService.addMoreSpaceAfterRefresh = true;
    await instance.onPromoFormSubmit({ code: 'potato' });

    expect(mockAccountService.account.spaceLeft).toBe(
      5000 * 1024 * 1024 + 1024,
    );
  });
});

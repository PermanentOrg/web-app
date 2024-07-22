/* @format */
import { Shallow } from 'shallow-render';
import { BillingResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';
import { CoreModule } from '@core/core.module';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { GaEventData } from '@shared/services/google-analytics/google-analytics.service';
import { EventService } from '@shared/services/event/event.service';
import { DialogRef } from '@angular/cdk/dialog';
import { EventData } from '@shared/services/google-analytics/google-analytics.service';
import { AnalyticsService } from '@shared/services/analytics/analytics.service';
import { PromoVOData } from '../../../models/promo-vo';
import { ApiService } from '../../../shared/services/api/api.service';
import { AccountVO } from '../../../models/account-vo';
import { MessageService } from '../../../shared/services/message/message.service';
import { StorageDialogComponent } from './storage-dialog.component';

class MockDialogRef {
  close(value?: any): void {
    // Mock close method
  }
}

const mockPromoResponse = {
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

class MockBillingRepo {
  public calledRedeemPromoCode = false;
  public redeemPromoCode(_value: PromoVOData): Promise<BillingResponse> {
    this.calledRedeemPromoCode = true;
    return Promise.resolve(new BillingResponse(mockPromoResponse));
  }
}

class MockAnalyticsService {
  public notifiyObservers(data: GaEventData): void {}
}

interface MockApiService {
  billing: MockBillingRepo;
}
class MockAccountService {
  public addedStorage: number | undefined;
  public refreshAccount(): Promise<void> {
    return Promise.resolve();
  }
  public setAccount(_account: AccountVO): void {}
  public getAccount(): AccountVO {
    return new AccountVO({ spaceLeft: 10000, spaceTotal: 10000 });
  }
  public addStorageBytes(sizeInBytes: number): void {
    this.addedStorage = sizeInBytes;
  }
}

describe('StorageDialogComponent', () => {
  let shallow: Shallow<StorageDialogComponent>;
  let messageShown: boolean = false;
  let mockAccountService: MockAccountService;
  let mockApiService: MockApiService;
  let mockAnalyticksService: MockAnalyticsService;
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
    mockAnalyticksService = new MockAnalyticsService();
    shallow = new Shallow(StorageDialogComponent, CoreModule)
      .dontMock(AccountService)
      .dontMock(ApiService)
      .mock(MessageService, {
        showError: () => {
          messageShown = true;
        },
      })
      .provide({ provide: AccountService, useValue: mockAccountService })
      .provide({ provide: ApiService, useValue: mockApiService })
      .provide({ provide: AnalyticsService, useValue: mockAnalyticksService })
      .provide({ provide: DialogRef, useClass: MockDialogRef })
      .provideMock([{ provide: ActivatedRoute, useValue: mockActivatedRoute }]);
  });

  it('should exist', async () => {
    const { element } = await shallow.render();

    expect(element).not.toBeNull();
  });

  it('should fetch dialog information from the API', async () => {
    const { instance } = await shallow.render();
    const promoData: PromoVOData = { code: 'promo' };
    await instance.onPromoFormSubmit(promoData);

    expect(mockApiService.billing.calledRedeemPromoCode).toBeTruthy();
  });

  it('should update the account after submititng the form ', async () => {
    const { instance } = await shallow.render();
    const promoData: PromoVOData = { code: 'promo' };
    await instance.onPromoFormSubmit(promoData);

    expect(mockAccountService.addedStorage).toBe(5000 * 1024 * 1024);
  });

  it('should enable the button after adding a promo code', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.promoForm.patchValue({
      code: 'promo1',
    });
    instance.promoForm.updateValueAndValidity();
    instance.activeTab = 'promo';
    fixture.detectChanges();
    const button = find('.btn-primary');

    expect(button.nativeElement.disabled).toBeFalsy();
  });

  it('should handle route and query parameter changes', async () => {
    const { instance } = await shallow.render();

    paramMap.next(convertToParamMap({ path: 'promo' }));

    queryParamMap.next(convertToParamMap({ promoCode: 'TellYourStory' }));

    expect(instance.activeTab).toBe('promo');
    expect(instance.promoForm.value).toEqual({ code: 'TellYourStory' });
  });

  it('should handle route changes', async () => {
    const { instance } = await shallow.render();

    paramMap.next(convertToParamMap({ path: 'add' }));

    expect(instance.activeTab).toBe('add');
  });
});

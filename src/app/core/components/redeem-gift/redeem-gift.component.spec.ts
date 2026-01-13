import { NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { AccountService } from '@shared/services/account/account.service';
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

@NgModule()
class DummyModule {}

describe('StorageDialogComponent', () => {
	let mockAccountService: MockAccountService;
	let mockApiService: MockApiService;
	let mockActivatedRoute;
	const paramMap = new BehaviorSubject(convertToParamMap({}));
	const queryParamMap = new BehaviorSubject(convertToParamMap({}));

	beforeEach(async () => {
		mockActivatedRoute = {
			paramMap: paramMap.asObservable(),
			queryParamMap: queryParamMap.asObservable(),
		};
		mockAccountService = new MockAccountService();
		mockApiService = {
			billing: new MockBillingRepo(),
		};
		await MockBuilder(RedeemGiftComponent, DummyModule)
			.keep(ReactiveFormsModule, { export: true })
			.keep(UntypedFormBuilder)
			.provide({
				provide: MessageService,
				useValue: { showError: () => {} },
			})
			.provide({ provide: AccountService, useValue: mockAccountService })
			.provide({ provide: ApiService, useValue: mockApiService })
			.provide({ provide: ActivatedRoute, useValue: mockActivatedRoute });
	});

	it('should exist', () => {
		const fixture = MockRender(RedeemGiftComponent);

		expect(fixture.point.nativeElement).not.toBeNull();
	});

	it('has an input for a prefilled promo code', () => {
		MockRender(RedeemGiftComponent, { promoCode: 'potato' });

		expect(ngMocks.find('input').nativeElement.value).toBe('potato');
	});

	it('should send an API request when submitting a promo code', async () => {
		const fixture = MockRender(RedeemGiftComponent);
		const instance = fixture.point.componentInstance;
		const promoData: PromoVOData = { code: 'promo' };
		await instance.onPromoFormSubmit(promoData);

		expect(mockApiService.billing.calledRedeemPromoCode).toBeTruthy();
		expect(instance.resultMessage.successful).toBeTrue();
	});

	it('should update the account after redeeming a promo code', async () => {
		const fixture = MockRender(RedeemGiftComponent);
		const instance = fixture.point.componentInstance;
		const promoData: PromoVOData = { code: 'promo' };
		await instance.onPromoFormSubmit(promoData);

		expect(mockAccountService.addedStorage).toBe(5000 * 1024 * 1024);
		expect(instance.resultMessage.successful).toBeTrue();
	});

	it('should enable the submit button after adding a promo code', () => {
		const fixture = MockRender(RedeemGiftComponent);
		const instance = fixture.point.componentInstance;
		instance.promoForm.patchValue({
			code: 'promo1',
		});
		instance.promoForm.updateValueAndValidity();
		fixture.detectChanges();
		const button = ngMocks.find('.btn-primary');

		expect(button.nativeElement.disabled).toBeFalsy();
	});

	it('should handle an invalid promo code', async () => {
		const fixture = MockRender(RedeemGiftComponent);
		const instance = fixture.point.componentInstance;
		mockApiService.billing.isSuccessful = false;
		await instance.onPromoFormSubmit({ code: 'potato' });

		expect(instance.resultMessage.successful).toBeFalse();
	});

	it('should handle any other unexpected errors when redeeming promo code', async () => {
		const fixture = MockRender(RedeemGiftComponent);
		const instance = fixture.point.componentInstance;
		mockAccountService.failRefresh = true;
		await instance.onPromoFormSubmit({ code: 'potato' });

		expect(instance.resultMessage.successful).toBeFalse();
	});

	it('should not bump up account storage if it has already been done on the server side', async () => {
		const fixture = MockRender(RedeemGiftComponent);
		const instance = fixture.point.componentInstance;
		mockAccountService.addMoreSpaceAfterRefresh = true;
		await instance.onPromoFormSubmit({ code: 'potato' });

		expect(mockAccountService.account.spaceLeft).toBe(
			5000 * 1024 * 1024 + 1024,
		);
	});
});

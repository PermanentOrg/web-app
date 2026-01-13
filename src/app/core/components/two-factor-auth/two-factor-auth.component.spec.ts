import { NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import {
	ReactiveFormsModule,
	FormsModule,
	UntypedFormBuilder,
} from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';
import { TwoFactorAuthComponent } from './two-factor-auth.component';

@NgModule()
class DummyModule {}

const mockApiService = {
	idpuser: {
		getTwoFactorMethods: async () =>
			await Promise.resolve([
				{ methodId: 'ABCD', value: 'test@example.com', method: 'mail' },
			]),
		disableTwoFactor: async (methodId, code) => await Promise.resolve(),
		sendDisableCode: async (methodId) => await Promise.resolve(),
		sendEnableCode: async (method, value) => await Promise.resolve(),
		enableTwoFactr: async (method, value, code) => await Promise.resolve(),
	},
};

describe('TwoFactorAuthComponent', () => {
	beforeEach(
		async () =>
			await MockBuilder(TwoFactorAuthComponent, DummyModule)
				.keep(HttpClientTestingModule, { export: true })
				.keep(ReactiveFormsModule, { export: true })
				.keep(FormsModule, { export: true })
				.keep(UntypedFormBuilder)
				.provide({
					provide: MessageService,
					useValue: { showError: () => {} },
				})
				.provide({
					provide: ApiService,
					useValue: mockApiService,
				}),
	);

	it('should create', () => {
		const fixture = MockRender(TwoFactorAuthComponent);

		expect(fixture.point.componentInstance).toBeTruthy();
	});

	it('should remove method and update form state', () => {
		const fixture = MockRender(TwoFactorAuthComponent);
		const instance = fixture.point.componentInstance;
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

	it('should format phone number correctly', () => {
		const fixture = MockRender(TwoFactorAuthComponent);
		const instance = fixture.point.componentInstance;
		instance.method = 'sms';
		instance.formatPhoneNumber('1234567890');

		expect(instance.form.get('contactInfo').value).toBe('(123) 456-7890');
	});

	it('should format phone number with country code correctly', () => {
		const fixture = MockRender(TwoFactorAuthComponent);
		const instance = fixture.point.componentInstance;
		instance.method = 'sms';
		instance.formatPhoneNumber('+12345678900');

		expect(instance.form.get('contactInfo').value).toBe('+1 (234) 567-8900');
	});

	it('should format international phone numbers correctly', () => {
		const fixture = MockRender(TwoFactorAuthComponent);
		const instance = fixture.point.componentInstance;
		instance.method = 'sms';
		instance.formatPhoneNumber('0040123456789');

		expect(instance.form.get('contactInfo').value).toBe('+401 (234) 567-89');
	});

	it('should handle international phone numbers with country code correctly', () => {
		const fixture = MockRender(TwoFactorAuthComponent);
		const instance = fixture.point.componentInstance;
		instance.method = 'sms';
		instance.formatPhoneNumber('+40123456789');

		expect(instance.form.get('contactInfo').value).toBe('+401 (234) 567-89');
	});

	it('should set codeSent to true when sendCode is called', async () => {
		const fixture = MockRender(TwoFactorAuthComponent);
		const instance = fixture.point.componentInstance;
		const event = {
			preventDefault: () => {},
		};
		await instance.sendCode(event);

		expect(instance.codeSent).toBe(true);
	});

	it('should call submitData with the form value', () => {
		const fixture = MockRender(TwoFactorAuthComponent);
		const instance = fixture.point.componentInstance;
		instance.form.setValue({ code: '1234', contactInfo: 'user@example.com' });

		const submitDataSpy = spyOn(instance, 'submitData').and.callThrough();
		instance.submitData(instance.form.value);

		expect(submitDataSpy).toHaveBeenCalledWith({
			code: '1234',
			contactInfo: 'user@example.com',
		});
	});

	it('should reset component state when cancel is called', () => {
		const fixture = MockRender(TwoFactorAuthComponent);
		const instance = fixture.point.componentInstance;
		instance.cancel();

		expect(instance.method).toBe('');
		expect(instance.selectedMethodToDelete).toBeNull();
		expect(instance.turnOn).toBe(false);
		expect(instance.form.get('contactInfo').value).toBe('');
		expect(instance.form.get('code').value).toBe('');
	});

	it('should display methods correctly in the table', () => {
		const methods = [
			{ methodId: 'email', method: 'email', value: 'janedoe@example.com' },
			{ methodId: 'sms', method: 'sms', value: '(123) 456-7890' },
		];

		const fixture = MockRender(TwoFactorAuthComponent);
		const instance = fixture.point.componentInstance;

		instance.methods = methods;

		fixture.detectChanges();

		const methodRows = ngMocks.findAll('.method');

		expect(methodRows.length).toBe(methods.length);
		expect(methodRows[0].nativeElement.textContent).toContain('Email');
		expect(methodRows[0].nativeElement.textContent).toContain(
			'janedoe@example.com',
		);

		expect(methodRows[1].nativeElement.textContent).toContain('SMS Text');
		expect(methodRows[1].nativeElement.textContent).toContain('(123) 456-7890');
	});

	it('should display the code input after the code was sent', () => {
		const fixture = MockRender(TwoFactorAuthComponent);
		const instance = fixture.point.componentInstance;

		instance.codeSent = true;
		instance.turnOn = true;
		instance.method = 'sms';
		fixture.detectChanges();

		const codeContainer = ngMocks.findAll('.code-container');

		expect(codeContainer.length).toBe(1);
	});

	it('should not display the code input if the code was not sent', () => {
		const fixture = MockRender(TwoFactorAuthComponent);
		const instance = fixture.point.componentInstance;

		instance.turnOn = true;
		instance.method = 'sms';
		fixture.detectChanges();

		const codeContainer = ngMocks.findAll('.code-container');

		expect(codeContainer.length).toBe(0);
	});

	it('should retrieve all the methods after a method has been deleted', async () => {
		const fixture = MockRender(TwoFactorAuthComponent);
		const instance = fixture.point.componentInstance;

		instance.methods = [
			{ methodId: 'email', method: 'email', value: 'janedoe@example.com' },
		];
		instance.selectedMethodToDelete = {
			methodId: 'email',
			method: 'email',
			value: 'janedoe@example.com',
		};

		spyOn(mockApiService.idpuser, 'disableTwoFactor').and.returnValue(
			Promise.resolve(),
		);
		spyOn(mockApiService.idpuser, 'getTwoFactorMethods').and.returnValue(
			Promise.resolve([
				{ methodId: 'sms', method: 'sms', value: '(123) 456-7890' },
			]),
		);

		await instance.submitRemoveMethod();

		expect(mockApiService.idpuser.getTwoFactorMethods).toHaveBeenCalled();
	});
});

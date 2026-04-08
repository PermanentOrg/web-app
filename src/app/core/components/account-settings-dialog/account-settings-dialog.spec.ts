import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { ActivatedRoute } from '@angular/router';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AccountSettingsDialogComponent } from './account-settings-dialog.component';

import { vi } from 'vitest';

describe('AccountSettingsDialogComponent', () => {
	let component: AccountSettingsDialogComponent;
	let fixture: ComponentFixture<AccountSettingsDialogComponent>;

	let mockDialogRef: any;
	let mockAccountService: any;
	let mockApiService: any;
	let mockMessageService: any;

	beforeEach(async () => {
		mockDialogRef = { close: vi.fn() } as any;
		mockAccountService = { getAccount: vi.fn(), logOut: vi.fn(), isEmailOrPhoneUnverified: vi.fn() } as any;
		mockApiService = {
			account: { delete: vi.fn() },
		} as any;
		mockMessageService = { showError: vi.fn() } as any;

		await TestBed.configureTestingModule({
			declarations: [AccountSettingsDialogComponent],
			providers: [
				{ provide: DIALOG_DATA, useValue: {} },
				{ provide: DialogRef, useValue: mockDialogRef },
				{ provide: AccountService, useValue: mockAccountService },
				{ provide: ApiService, useValue: mockApiService },
				{ provide: MessageService, useValue: mockMessageService },
				{
					provide: ActivatedRoute,
					useValue: { snapshot: { fragment: null } },
				},
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(AccountSettingsDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create component', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with default activeTab as "email-phone"', () => {
		expect(component.activeTab).toBe('email-phone');
	});

	it('should switch tab when setTab is called', () => {
		component.setTab('notification');

		expect(component.activeTab).toBe('notification');
	});

	it('should call dialogRef.close() on onDoneClick()', () => {
		component.onDoneClick();

		expect(mockDialogRef.close).toHaveBeenCalled();
	});

	it('should not proceed if deleteVerify does not match verifyText', async () => {
		component.deleteVerify = 'WRONG';
		await component.onDeleteAccountConfirm();

		expect(mockApiService.account.delete).not.toHaveBeenCalled();
	});
});

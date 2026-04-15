import { AccountService } from '@shared/services/account/account.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ArchiveVO, AccountVO } from '@models/index';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { PayerService } from '@shared/services/payer/payer.service';
import { ApiService } from '../../../shared/services/api/api.service';
import { MessageService } from '../../../shared/services/message/message.service';
import { ArchivePayerComponent } from './archive-payer.component';

import { vi } from 'vitest';

describe('ArchivePayerComponent', () => {
	let component: ArchivePayerComponent;
	let fixture: ComponentFixture<ArchivePayerComponent>;
	let mockAccountService;

	beforeEach(async () => {
		mockAccountService = {
			getAccount: vi.fn()
				.mockReturnValue({ accountId: '1' }),
			getArchive: vi.fn()
				.mockReturnValue({ accessRole: 'access.role.manager' }),
		};

		await TestBed.configureTestingModule({
			declarations: [ArchivePayerComponent],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [
				{ provide: AccountService, useValue: mockAccountService },
				{ provide: DialogCdkService, useValue: {} },
				{ provide: ApiService, useValue: { archive: { update: vi.fn() } } },
				{ provide: PayerService, useValue: { payerId: null } },
				HttpClient,
				HttpHandler,
				MessageService,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ArchivePayerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('displays no payer when there is no payer id assigned to the account', () => {
		component.hasPayer = false;
		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();
		const divElement = fixture.nativeElement.querySelector('#no-payer');

		expect(divElement).toBeTruthy();
	});

	it('displays payer data when there is a payer id assigned to the account', () => {
		const payer = new AccountVO({});
		payer.fullName = 'Test name';
		payer.primaryEmail = 'test@email.com';
		payer.accessRole = 'access.role.owner';

		fixture.componentRef.setInput('payer', payer);
		component.hasPayer = true;

		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();
		const divElement = fixture.nativeElement.querySelector('#with-payer');

		expect(divElement).toBeTruthy();
	});

	it('displays the component even if no payer was found for unknown reasons', () => {
		component.hasPayer = true;

		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();
		const divElement = fixture.nativeElement.querySelector('#with-payer');

		expect(divElement).toBeTruthy();
	});

	it('displays the current payer data if the logged account is different than the payer', () => {
		const payer = new AccountVO({});

		payer.accountId = '1';
		payer.fullName = 'Test name';
		payer.primaryEmail = 'test@email.com';
		payer.accessRole = 'access.role.owner';

		component.hasPayer = true;
		component.isPayerDifferentThanLoggedUser = true;
		fixture.componentRef.setInput('payer', payer);

		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();
		const div = fixture.nativeElement.querySelector('#is-not-payer');

		expect(div).toBeTruthy();
	});

	it('displays the current payer data if the logged account is the same as the payer', () => {
		component.hasPayer = true;
		component.isPayerDifferentThanLoggedUser = false;

		const payer = new AccountVO({});
		payer.fullName = 'Test name';
		payer.primaryEmail = 'test@email.com';
		payer.accessRole = 'access.role.owner';

		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();
		const div = fixture.nativeElement.querySelector('#is-payer');

		expect(div).toBeTruthy();
	});

	it('should set hasPayer to true when archive.payerAccountId exists', () => {
		const archive = new ArchiveVO({});
		archive.payerAccountId = '1';

		const payer = new AccountVO({});
		payer.fullName = 'Test name';
		payer.primaryEmail = 'test@email.com';
		payer.accessRole = 'access.role.owner';

		fixture.componentRef.setInput('archive', archive);
		fixture.componentRef.setInput('payer', payer);
		component.ngOnInit();

		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();

		expect(component.hasPayer).toEqual(true);
	});

	it('should set hasPayer to false when archive.payerAccountId does not exist', () => {
		const archive = new ArchiveVO({});
		archive.payerAccountId = null;

		const payer = undefined;

		fixture.componentRef.setInput('archive', archive);
		fixture.componentRef.setInput('payer', payer);

		component.ngOnInit();
		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();

		expect(component.hasPayer).toEqual(false);
	});

	it('should check if the payer is the same as the account id', () => {
		const archive = new ArchiveVO({});
		archive.payerAccountId = '1';
		fixture.componentRef.setInput('archive', archive);

		const payer = new AccountVO({});
		payer.fullName = 'Test name';
		payer.primaryEmail = 'test@email.com';
		payer.accessRole = 'access.role.owner';

		fixture.componentRef.setInput('payer', payer);

		component.ngOnInit();
		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();

		expect(component.isPayerDifferentThanLoggedUser).toEqual(false);
	});

	it('should check if the payer is not the same as the account id', () => {
		const archive = new ArchiveVO({});
		archive.payerAccountId = '2';
		fixture.componentRef.setInput('archive', archive);

		const payer = new AccountVO({});
		payer.fullName = 'Test name';
		payer.primaryEmail = 'test@email.com';
		payer.accessRole = 'access.role.owner';

		fixture.componentRef.setInput('payer', payer);

		component.ngOnInit();
		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();

		expect(component.isPayerDifferentThanLoggedUser).toEqual(true);
	});
});

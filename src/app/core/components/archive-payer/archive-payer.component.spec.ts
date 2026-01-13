import { AccountService } from '@shared/services/account/account.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArchiveVO, AccountVO } from '@models/index';
import { MessageService } from '../../../shared/services/message/message.service';
import { ArchivePayerComponent } from './archive-payer.component';

describe('ArchivePayerComponent', () => {
	let component: ArchivePayerComponent;
	let fixture: ComponentFixture<ArchivePayerComponent>;
	let mockAccountService;

	beforeEach(async () => {
		mockAccountService = {
			getAccount: jasmine
				.createSpy('getAccount')
				.and.returnValue({ accountId: '1' }),
			getArchive: jasmine
				.createSpy('getArchive')
				.and.returnValue({ accessRole: 'access.role.manager' }),
		};

		await TestBed.configureTestingModule({
			declarations: [ArchivePayerComponent],
			providers: [
				{ provide: AccountService, useValue: mockAccountService },
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
		fixture.detectChanges();
		const divElement = fixture.nativeElement.querySelector('#no-payer');

		expect(divElement).toBeTruthy();
	});

	it('displays payer data when there is a payer id assigned to the account', () => {
		const payer = new AccountVO({});
		payer.fullName = 'Test name';
		payer.primaryEmail = 'test@email.com';
		payer.accessRole = 'access.role.owner';

		component.payer = payer;
		component.hasPayer = true;

		fixture.detectChanges();
		const divElement = fixture.nativeElement.querySelector('#with-payer');

		expect(divElement).toBeTruthy();
	});

	it('displays the component even if no payer was found for unknown reasons', () => {
		component.hasPayer = true;

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
		component.payer = payer;

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

		component.archive = archive;
		component.payer = payer;
		component.ngOnInit();

		fixture.detectChanges();

		expect(component.hasPayer).toEqual(true);
	});

	it('should set hasPayer to false when archive.payerAccountId does not exist', () => {
		const archive = new ArchiveVO({});
		archive.payerAccountId = null;

		const payer = undefined;

		component.archive = archive;
		component.payer = payer;

		component.ngOnInit();
		fixture.detectChanges();

		expect(component.hasPayer).toEqual(false);
	});

	it('should check if the payer is the same as the account id', () => {
		const archive = new ArchiveVO({});
		archive.payerAccountId = '1';
		component.archive = archive;

		const payer = new AccountVO({});
		payer.fullName = 'Test name';
		payer.primaryEmail = 'test@email.com';
		payer.accessRole = 'access.role.owner';

		component.payer = payer;

		component.ngOnInit();
		fixture.detectChanges();

		expect(component.isPayerDifferentThanLoggedUser).toEqual(false);
	});

	it('should check if the payer is not the same as the account id', () => {
		const archive = new ArchiveVO({});
		archive.payerAccountId = '2';
		component.archive = archive;

		const payer = new AccountVO({});
		payer.fullName = 'Test name';
		payer.primaryEmail = 'test@email.com';
		payer.accessRole = 'access.role.owner';

		component.payer = payer;

		component.ngOnInit();
		fixture.detectChanges();

		expect(component.isPayerDifferentThanLoggedUser).toEqual(true);
	});
});

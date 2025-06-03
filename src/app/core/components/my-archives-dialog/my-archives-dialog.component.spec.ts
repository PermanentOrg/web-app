import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArchiveVO, AccountVO } from '@models';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { MyArchivesDialogComponent } from './my-archives-dialog.component';

describe('MyArchivesDialogComponent', () => {
	let component: MyArchivesDialogComponent;
	let fixture: ComponentFixture<MyArchivesDialogComponent>;
	let accountServiceSpy: jasmine.SpyObj<AccountService>;
	let apiServiceSpy: jasmine.SpyObj<ApiService>;
	let promptServiceSpy: jasmine.SpyObj<PromptService>;
	let messageServiceSpy: jasmine.SpyObj<MessageService>;
	let dialogRefSpy: jasmine.SpyObj<DialogRef>;

	beforeEach(async () => {
		accountServiceSpy = jasmine.createSpyObj('AccountService', [
			'refreshArchives',
			'getAccount',
			'getArchive',
			'getArchives',
			'changeArchive',
			'updateAccount',
		]);

		apiServiceSpy = jasmine.createSpyObj('ApiService', ['archive'], {
			archive: jasmine.createSpyObj('archive', ['delete', 'accept', 'decline']),
		});

		promptServiceSpy = jasmine.createSpyObj('PromptService', ['confirm']);
		messageServiceSpy = jasmine.createSpyObj('MessageService', ['showError']);
		dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);

		await TestBed.configureTestingModule({
			declarations: [MyArchivesDialogComponent],
			providers: [
				{ provide: AccountService, useValue: accountServiceSpy },
				{ provide: ApiService, useValue: apiServiceSpy },
				{ provide: PromptService, useValue: promptServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: DialogRef, useValue: dialogRefSpy },
				{
					provide: ActivatedRoute,
					useValue: { snapshot: { root: { params: {}, children: [] } } },
				},
				{
					provide: Router,
					useValue: { routerState: { snapshot: { root: {} } } },
				},
				{
					provide: DIALOG_DATA,
					useValue: {},
				},

				UntypedFormBuilder,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(MyArchivesDialogComponent);
		component = fixture.componentInstance;

		const mockAccount: AccountVO = new AccountVO({ defaultArchiveId: '123' });
		const mockCurrentArchive: ArchiveVO = new ArchiveVO({
			archiveId: '123',
			fullName: 'Test Archive',
			accessRole: 'access.role.owner',
		});

		accountServiceSpy.getAccount.and.returnValue(mockAccount);
		accountServiceSpy.getArchive.and.returnValue(mockCurrentArchive);
		accountServiceSpy.getArchives.and.returnValue([
			new ArchiveVO({
				archiveId: '123',
				fullName: 'Test Archive',
				status: 'status.generic.ok',
				accessRole: 'access.role.owner',
			}),
		]);
		accountServiceSpy.refreshArchives.and.returnValue(
			Promise.resolve([new ArchiveVO({ archiveId: 1 })]),
		);

		fixture.detectChanges();
	});

	it('should initialize and categorize archives correctly', async () => {
		await component.ngOnInit();

		expect(component.archives?.length).toBe(1);
		expect(component.pendingArchives?.length).toBe(0);
	});

	it('should switch tabs when setTab is called', () => {
		component.setTab('pending');

		expect(component.activeTab).toBe('pending');
	});

	it('should close dialog onDoneClick', () => {
		component.onDoneClick();

		expect(dialogRefSpy.close).toHaveBeenCalled();
	});

	it('should initialize and separate pending/regular archives correctly', async () => {
		const mockAccount = new AccountVO({ defaultArchiveId: '111' });
		const mockCurrentArchive = new ArchiveVO({
			archiveId: '111',
			fullName: 'Current Archive',
		});

		const pending = new ArchiveVO({
			archiveId: '222',
			fullName: 'Pending Archive',
			status: 'status.generic.pending',
		});

		const active = new ArchiveVO({
			archiveId: '333',
			fullName: 'Active Archive',
			status: 'status.generic.ok',
		});

		accountServiceSpy.refreshArchives.and.returnValue(
			Promise.resolve([new ArchiveVO({})]),
		);
		accountServiceSpy.getAccount.and.returnValue(mockAccount);
		accountServiceSpy.getArchive.and.returnValue(mockCurrentArchive);
		accountServiceSpy.getArchives.and.returnValue([pending, active]);

		await component.ngOnInit();

		expect(accountServiceSpy.refreshArchives).toHaveBeenCalled();
		expect(component.account).toEqual(mockAccount);
		expect(component.currentArchive).toEqual(mockCurrentArchive);
		expect(component.pendingArchives.length).toBe(1);
		expect(component.archives.length).toBe(1);
		expect(component.pendingArchives[0].archiveId).toBe('222');
		expect(component.archives[0].archiveId).toBe('333');
	});
});

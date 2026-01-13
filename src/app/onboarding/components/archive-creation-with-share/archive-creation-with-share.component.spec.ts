import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ApiService } from '@shared/services/api/api.service';
import { InviteVO, InviteVOData } from '@models/invite-vo';
import { InviteResponse } from '@shared/services/api/invite.repo';
import { ArchiveCreationWithShareComponent } from './archive-creation-with-share.component';

class MockInviteApiResponse extends InviteResponse {
	public inviteVo: InviteVO | undefined;

	constructor(invite: InviteVOData) {
		super({});
		this.inviteVo = new InviteVO(invite);
	}

	public getInviteVO(): InviteVO {
		return this.inviteVo;
	}
}

class MockInviteRepo {
	public inviteVo: InviteVOData = {};
	protected token: string = null;

	public resetToken(): void {
		this.token = null;
	}

	public getToken(): string {
		return this.token;
	}

	public async getFullShareInvite(token: string): Promise<InviteResponse> {
		this.token = token;
		return new MockInviteApiResponse(this.inviteVo);
	}
}

describe('ArchiveCreationWithShareToken', () => {
	let fixture: ComponentFixture<ArchiveCreationWithShareComponent>;
	let instance: ArchiveCreationWithShareComponent;
	let mockInvite: MockInviteRepo;

	function setLocalStorage(token: string) {
		spyOn(localStorage, 'getItem').and.returnValue(token);
	}

	beforeEach(async () => {
		mockInvite = new MockInviteRepo();

		await TestBed.configureTestingModule({
			declarations: [ArchiveCreationWithShareComponent],
			providers: [
				{
					provide: ApiService,
					useValue: { invite: mockInvite },
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	it('should create', async () => {
		setLocalStorage(null);
		fixture = TestBed.createComponent(ArchiveCreationWithShareComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		expect(instance).toBeTruthy();
	});

	it('should fetch invite data and set sharer and shared item names when shareToken is present', async () => {
		mockInvite.inviteVo = {
			AccountVO: { fullName: 'Sharer Name' },
			RecordVO: { displayName: 'Shared Item Name' },
		};
		setLocalStorage('shareToken');

		fixture = TestBed.createComponent(ArchiveCreationWithShareComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		instance.ngOnInit();
		await fixture.whenStable();

		expect(mockInvite.getToken()).toBe('shareToken');
		expect(instance.sharerName).toBe('Sharer Name');
		expect(instance.sharedItemName).toBe('Shared Item Name');
	});

	it('should not fetch invite data if no shareToken is present', async () => {
		setLocalStorage(null);
		fixture = TestBed.createComponent(ArchiveCreationWithShareComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		instance.ngOnInit();
		await fixture.whenStable();

		expect(mockInvite.getToken()).toBeNull();
		expect(instance.sharerName).toBeUndefined();
		expect(instance.sharedItemName).toBeUndefined();
	});

	it('should display the record icon if the shared item is a record', async () => {
		mockInvite.inviteVo = {
			AccountVO: { fullName: 'Sharer Name' },
			RecordVO: { displayName: 'Shared Item Name' },
		};
		setLocalStorage('shareToken');

		fixture = TestBed.createComponent(ArchiveCreationWithShareComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		instance.ngOnInit();
		await fixture.whenStable();

		expect(instance.isFolder).toBe(false);
	});

	it('should display the folder icon if the shared item is a folder', async () => {
		mockInvite.inviteVo = {
			AccountVO: { fullName: 'Sharer Name' },
			FolderVO: { displayName: 'potato' },
		};
		setLocalStorage('shareToken');

		fixture = TestBed.createComponent(ArchiveCreationWithShareComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		instance.ngOnInit();
		await fixture.whenStable();

		expect(instance.isFolder).toBe(true);
	});

	it('should fetch invite data and set sharer and shared item names when copyToken is present', async () => {
		const mockShareApi = {
			checkShareLink: jasmine.createSpy().and.returnValue(
				Promise.resolve({
					Results: [
						{
							data: [
								{
									Shareby_urlVO: {
										AccountVO: { fullName: 'Sharer Name' },
										RecordVO: { displayName: 'Shared Item Name' },
									},
								},
							],
						},
					],
				}),
			),
		};

		TestBed.resetTestingModule();
		await TestBed.configureTestingModule({
			declarations: [ArchiveCreationWithShareComponent],
			providers: [
				{
					provide: ApiService,
					useValue: { invite: mockInvite, share: mockShareApi },
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(ArchiveCreationWithShareComponent);
		instance = fixture.componentInstance;

		spyOn(localStorage, 'getItem').and.callFake((key) => {
			if (key === 'shareTokenFromCopy') return 'copyToken';
			return null;
		});

		fixture.detectChanges();
		instance.ngOnInit();
		await fixture.whenStable();

		expect(mockShareApi.checkShareLink).toHaveBeenCalledWith('copyToken');

		expect(instance.sharerName).toBe('Sharer Name');
		expect(instance.sharedItemName).toBe('Shared Item Name');
	});

	it('should set sharedItemName using FolderVO if RecordVO is missing', async () => {
		const mockShareApi = {
			checkShareLink: jasmine.createSpy().and.returnValue(
				Promise.resolve({
					Results: [
						{
							data: [
								{
									Shareby_urlVO: {
										AccountVO: { fullName: 'Sharer Name' },
										FolderVO: { displayName: 'Shared Folder Name' },
									},
								},
							],
						},
					],
				}),
			),
		};

		TestBed.resetTestingModule();
		await TestBed.configureTestingModule({
			declarations: [ArchiveCreationWithShareComponent],
			providers: [
				{
					provide: ApiService,
					useValue: { invite: mockInvite, share: mockShareApi },
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(ArchiveCreationWithShareComponent);
		instance = fixture.componentInstance;

		spyOn(localStorage, 'getItem').and.callFake((key) => {
			if (key === 'shareTokenFromCopy') return 'copyToken';
			return null;
		});

		fixture.detectChanges();
		instance.ngOnInit();
		await fixture.whenStable();

		expect(mockShareApi.checkShareLink).toHaveBeenCalledWith('copyToken');
		expect(instance.sharerName).toBe('Sharer Name');
		expect(instance.sharedItemName).toBe('Shared Folder Name'); // Folder name should be set
	});
});

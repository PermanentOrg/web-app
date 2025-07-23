import {
	AccountVO,
	ArchiveVO,
	DirectiveData,
	LegacyContact,
} from '@models/index';

export class MockAccountService {
	public static mockAccount: AccountVO = new AccountVO({
		accountId: 1,
	});
	public static mockArchive: ArchiveVO = new ArchiveVO({
		archiveId: 1,
		fullName: 'The Testing Archive',
	});

	public getArchive(): ArchiveVO {
		return MockAccountService.mockArchive;
	}

	public getAccount(): AccountVO {
		return MockAccountService.mockAccount;
	}
}

export class MockDirectiveRepo {
	public static failRequest: boolean = false;
	public static failLegacyRequest: boolean = false;
	public static legacyContactName: string = null;
	public static legacyContactEmail: string = null;
	public static mockStewardId: number = null;
	public static mockStewardEmail: string = null;
	public static mockNote: string = null;

	public static reset(): void {
		MockDirectiveRepo.failRequest = false;
		MockDirectiveRepo.mockStewardId = null;
		MockDirectiveRepo.mockNote = null;
		MockDirectiveRepo.mockStewardEmail = null;
		MockDirectiveRepo.failLegacyRequest = false;
		MockDirectiveRepo.legacyContactName = null;
		MockDirectiveRepo.legacyContactEmail = null;
	}

	public createDirective(): DirectiveData {
		const testDirectiveId = '39b2a5fa-3508-4030-91b6-21dc6ec7a1ab';
		return {
			directiveId: testDirectiveId,
			archiveId: 1,
			type: 'admin',
			createdDt: new Date(),
			updatedDt: new Date(),
			trigger: {
				directiveTriggerId: testDirectiveId,
				directiveId: testDirectiveId,
				type: 'admin',
				createdDt: new Date(),
				updatedDt: new Date(),
			},
			steward: {
				email: MockDirectiveRepo.mockStewardEmail,
				name: '',
			},
			note: MockDirectiveRepo.mockNote,
			executionDt: null,
		};
	}

	public async get(): Promise<DirectiveData> {
		if (MockDirectiveRepo.failRequest) {
			throw new Error('Unit Testing: Forced Request Failure');
		}
		return this.createDirective();
	}

	public async getLegacyContact(): Promise<LegacyContact> {
		if (MockDirectiveRepo.failLegacyRequest) {
			throw new Error('Unit Testing: Forced Request Failure');
		}
		return {
			name: MockDirectiveRepo.legacyContactName,
			email: MockDirectiveRepo.legacyContactEmail,
		};
	}
}

export class MockApiService {
	public directive = new MockDirectiveRepo();
}

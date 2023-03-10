import { AccountVO, ArchiveVO, Directive } from '@models/index';

export class MockAccountService {
  public static mockArchive: ArchiveVO = new ArchiveVO({
    archiveId: 1,
    fullName: 'The Testing Archive',
  });

  public getArchive(): ArchiveVO {
    return MockAccountService.mockArchive;
  }
}

export class MockDirectiveRepo {
  public static failRequest: boolean = false;
  public static mockStewardId: number = null;
  public static mockNote: string = null;

  public static reset(): void {
    this.failRequest = false;
    this.mockStewardId = null;
    this.mockNote = null;
  }

  public async get(): Promise<Directive> {
    if (MockDirectiveRepo.failRequest) {
      throw new Error('Unit Testing: Forced Request Failure');
    }
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
      stewardAccountId: MockDirectiveRepo.mockStewardId,
      note: MockDirectiveRepo.mockNote,
      executionDt: null,
    };
  }
}

export class MockAccountRepo {
  public static failRequest = false;
  public static emailAddress = 'test@example.com';

  public static reset(): void {
    MockAccountRepo.failRequest = false;
    MockAccountRepo.emailAddress = 'test@example.com';
  }

  public async get() {
    if (MockAccountRepo.failRequest) {
      throw new Error('Unit Testing: Forced Request Failure');
    }
    return {
      getAccountVO() {
        return new AccountVO({
          accountId: 1000,
          primaryEmail: MockAccountRepo.emailAddress,
        });
      },
    };
  }
}

export class MockApiService {
  public directive = new MockDirectiveRepo();
  public account = new MockAccountRepo();
}

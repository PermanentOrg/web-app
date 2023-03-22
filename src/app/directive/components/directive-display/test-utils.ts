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
  public static mockStewardEmail: string = null;
  public static mockNote: string = null;

  public static reset(): void {
    MockDirectiveRepo.failRequest = false;
    MockDirectiveRepo.mockStewardId = null;
    MockDirectiveRepo.mockNote = null;
    MockDirectiveRepo.mockStewardEmail = null;
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
      stewardEmail: MockDirectiveRepo.mockStewardEmail,
      note: MockDirectiveRepo.mockNote,
      executionDt: null,
    };
  }
}

export class MockApiService {
  public directive = new MockDirectiveRepo();
}

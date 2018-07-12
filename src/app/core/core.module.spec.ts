import { CoreModule } from './core.module';
import { ArchiveVO } from '../models';

const testUser = {
  name: 'Test Account',
  email: 'tstr@permanent.org',
  password: 'Abc123!!!!',
  phone: '8324553388'
};

const testArchive = {
  archiveId: 1,
  archiveNbr: '0001-0000',
  fullName: testUser.name,
  status: 'status.auth.ok',
  type: 'type.archive.person'
};

const testAccount = {
  accountId: 1,
  fullName: testUser.name,
  primaryEmail: testUser.email,
  primaryPhone: testUser.phone,
  defaultArchiveId: testArchive.archiveId,
  status: 'status.auth.ok',
  type: 'type.account.standard'
};

describe('CoreModule', () => {
  let coreModule: CoreModule;

  beforeEach(() => {
    coreModule = new CoreModule();
  });

  it('should create an instance', () => {
    expect(coreModule).toBeTruthy();
  });
});

export const TEST_DATA = {
  user: testUser,
  archive: testArchive,
  account: testAccount
};

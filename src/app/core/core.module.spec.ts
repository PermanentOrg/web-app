import { CoreModule } from './core.module';

const testData = require('@root/test/data.json');
const testData2 = require('@root/test/data.2.json');

const testUser = {
  name: 'Unit Test',
  email: 'aatwood+unittest@permanent.org',
  password: 'Abc123!!!!',
  phone: '8324553388'
};

const testUser2 = {
  name: 'Andrew Atwood',
  email: 'aatwood@permanent.org',
  password: 'Abc123!!!!',
  phone: '8324553388'
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
  archive: testData.ArchiveVO,
  account: testData.AccountVO
};

export const TEST_DATA_2 = {
  user: testUser2,
  archive: testData2.ArchiveVO,
  account: testData2.AccountVO
};

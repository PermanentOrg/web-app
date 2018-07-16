import { CoreModule } from './core.module';
import { ArchiveVO } from '../models';

const testData = require('../../test/data.json');
const testUser = {
  name: 'Unit Test',
  email: 'aatwood+unittest@permanent.org',
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
  user: testData,
  archive: testData.ArchiveVO,
  account: testData.AccountVO
};

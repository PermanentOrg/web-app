import { PermanentFilesystem } from './permanent-filesystem';
import { FakeFilesystemApi } from './mocks/fake-filesystem-api';

describe('Permanent Filesystem (Folder Caching)', () => {
  let fs: PermanentFilesystem;
  let api: FakeFilesystemApi;

  beforeEach(() => {
    api = new FakeFilesystemApi();
    fs = new PermanentFilesystem(api);
  });

  it('should exist', () => {
    expect(fs).toBeTruthy();
  });

  it('should be able to fetch the filesystem root', async () => {
    const root = await fs.getArchiveRoot({ archiveId: 0 });

    expect(root).toBeTruthy();
    expect(api.methodWasCalled('getRoot')).toBeTrue();
  });

  it('should be able to fetch an arbitrary folder', async () => {
    const folder = await fs.getFolder({ folder_linkId: 0 });

    expect(folder).toBeTruthy();
    expect(api.methodWasCalled('navigate')).toBeTrue();
  });

  it('should be able to fetch an arbitrary record', async () => {
    const record = await fs.getRecord({ recordId: 0 });

    expect(record).toBeTruthy();
    expect(api.methodWasCalled('recordGet')).toBeTrue();
  });
});

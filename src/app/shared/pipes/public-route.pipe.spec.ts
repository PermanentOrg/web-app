import { FolderVO, RecordVO } from '@models';
import { PublicRoutePipe } from './public-route.pipe';

describe('PublicRoutePipe', () => {
  it('create an instance', () => {
    const pipe = new PublicRoutePipe();

    expect(pipe).toBeTruthy();
  });

  it('returns correct link for folder', () => {
    const pipe = new PublicRoutePipe();
    const folder = new FolderVO({
      folder_linkId: 100,
      archiveNbr: '0001-00gh',
    });
    const route = pipe.transform(folder);

    expect(route).toBeDefined();
    expect(route).toEqual([
      '/p',
      'archive',
      '0001-0000',
      folder.archiveNbr,
      folder.folder_linkId,
    ]);
  });

  it('returns correct link for record', () => {
    const pipe = new PublicRoutePipe();
    const record = new RecordVO({
      ParentFolderVOs: [
        new RecordVO({
          folder_linkId: 1234,
          archiveNbr: '0001-meow',
        }),
      ],
      folder_linkId: 1001,
      archiveNbr: '0001-00gp',
    });
    const route = pipe.transform(record);

    expect(route).toBeDefined();
    expect(route).toEqual([
      '/p',
      'archive',
      '0001-0000',
      '0001-meow',
      '1234',
      'record',
      record.archiveNbr,
    ]);
  });
});

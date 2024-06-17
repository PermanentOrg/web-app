/* @format */
import { DataStatus } from './data-status.enum';
import { RecordVO, ShareVO } from '.';

describe('RecordVO', () => {
  function extendBaseShareVO(
    share: Partial<ShareVO>,
    fullName: string = 'Unit Test',
  ): ShareVO {
    return new ShareVO({
      status: 'status.generic.ok',
      accessRole: 'access.role.viewer',
      ArchiveVO: { fullName },
      ...share,
    });
  }
  it('should exist', () => {
    expect(new RecordVO({})).toBeTruthy();
  });

  it('should sort ShareVOs by pending status', () => {
    const shares = new RecordVO({
      ShareVOs: [
        extendBaseShareVO({ status: 'status.generic.deleted' }),
        extendBaseShareVO({ status: 'status.generic.ok' }),
        extendBaseShareVO({ status: 'status.generic.pending' }),
      ],
    }).ShareVOs;

    expect(shares.map((n) => n.status)).toEqual([
      'status.generic.pending',
      'status.generic.deleted',
      'status.generic.ok',
    ]);
  });

  it('should sort ShareVOs by access role after pending status', () => {
    const shares = new RecordVO({
      ShareVOs: [
        extendBaseShareVO({ accessRole: 'access.role.viewer' }),
        extendBaseShareVO({ accessRole: 'access.role.contributor' }),
        extendBaseShareVO({ accessRole: 'access.role.editor' }),
        extendBaseShareVO({ accessRole: 'access.role.curator' }),
        extendBaseShareVO({ accessRole: 'access.role.manager' }),
        extendBaseShareVO({ accessRole: 'access.role.owner' }),
      ],
    }).ShareVOs;

    expect(shares.map((n) => n.accessRole)).toEqual([
      'access.role.owner',
      'access.role.manager',
      'access.role.curator',
      'access.role.editor',
      'access.role.contributor',
      'access.role.viewer',
    ]);
  });

  it('should sort ShareVOs by Archive Name after access role', () => {
    const shares = new RecordVO({
      ShareVOs: [
        extendBaseShareVO({}, 'Zzz'),
        extendBaseShareVO({}, 'zYz'),
        extendBaseShareVO({}, 'abc'),
      ],
    }).ShareVOs;

    expect(shares.map((n) => n.ArchiveVO.fullName)).toEqual([
      'abc',
      'zYz',
      'Zzz',
    ]);
  });

  it('can set a custom dataStatus', () => {
    const record = new RecordVO({}, { dataStatus: DataStatus.Full });

    expect(record.dataStatus).toBe(DataStatus.Full);
  });

  it('formats dates properly', () => {
    const record = new RecordVO({
      displayDT: '2023-01-19T19:33:03',
      displayEndDT: '2023-01-19T19:33:03.000Z',
      derivedDT: null,
      derivedEndDT: 'potato',
    });

    expect(record.displayDT).toBe('2023-01-19T19:33:03.000Z');
    expect(record.displayEndDT).toBe('2023-01-19T19:33:03.000Z');
    expect(record.derivedDT).toBe(null);
    expect(record.derivedEndDT).toBe(null);
  });

  it('can update a record', () => {
    const record = new RecordVO({ displayName: 'Unit Test' });
    record.update({ displayName: 'Potato' });

    expect(record.displayName).toBe('Potato');
  });

  it('initializes any ShareVOs provided when updated', () => {
    const record = new RecordVO({});
    record.update({ ShareVOs: [{}] });

    expect(record.ShareVOs[0]).toBeInstanceOf(ShareVO);
  });
});

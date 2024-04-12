/* @format */
import { DataStatus } from './data-status.enum';
import { ArchiveVO, FolderVO, RecordVO } from '.';

describe('ArchiveVO', () => {
  it('should exist', () => {
    expect(new ArchiveVO({})).toBeTruthy();
  });

  it('can check pending status', () => {
    expect(new ArchiveVO({}).isPending()).toBeFalse();

    expect(
      new ArchiveVO({ status: 'status.generic.ok' }).isPending()
    ).toBeFalse();

    expect(
      new ArchiveVO({ status: 'status.generic.deleted' }).isPending()
    ).toBeFalse();

    expect(
      new ArchiveVO({ status: 'status.generic.pending' }).isPending()
    ).toBeTrue();
  });

  describe('ItemVO conversion', () => {
    it('should do nothing on a null case', () => {
      expect(new ArchiveVO({}).ItemVOs).toBeUndefined();
    });

    it('should do nothing on an empty array', () => {
      expect(new ArchiveVO({ ItemVOs: [] }).ItemVOs.length).toBe(0);
    });

    it('should ignore items without a type', () => {
      expect(new ArchiveVO({ ItemVOs: [{ type: null }] }).ItemVOs.length).toBe(
        0
      );
    });

    it('should initialize folder items as folderVos', () => {
      expect(
        new ArchiveVO({ ItemVOs: [{ type: 'type.folder.private' }] }).ItemVOs[0]
      ).toBeInstanceOf(FolderVO);
    });

    it('should initialize any other items as recordVos', () => {
      const items = new ArchiveVO({
        ItemVOs: [
          { type: 'type.record.image' },
          { type: 'weird.unexpected.type' },
        ],
      }).ItemVOs;

      expect(items[0]).toBeInstanceOf(RecordVO);
      expect(items[1]).toBeInstanceOf(RecordVO);
    });

    it('should not initialize children of FolderVOs', () => {
      const folder = new ArchiveVO({
        ItemVOs: [
          {
            type: 'type.folder.private',
            ChildItemVOs: [{ type: 'type.record.image' }],
          },
        ],
      }).ItemVOs[0] as FolderVO;

      expect(folder.ChildItemVOs[0]).not.toBeInstanceOf(RecordVO);
      expect(folder.ChildItemVOs[0]).not.toBeInstanceOf(FolderVO);
    });

    it('should set datastatus to lean for all ItemVOs', () => {
      const items = new ArchiveVO({
        ItemVOs: [
          { type: 'type.record.image' },
          { type: 'type.folder.private' },
        ],
      }).ItemVOs;

      for (const item of items) {
        expect(item.dataStatus).toBe(DataStatus.Lean);
      }
    });
  });
});

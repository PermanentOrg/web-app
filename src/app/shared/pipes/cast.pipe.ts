import { Pipe, PipeTransform } from '@angular/core';
import { ArchiveVO, FolderVO, ItemVO, RecordVO } from '@models';

@Pipe({
  name: 'asFolder',
  pure: true,
})
export class FolderCastPipe implements PipeTransform {
  constructor() {}

  transform(value: ItemVO, args?: any): FolderVO {
    return value as FolderVO;
  }
}

@Pipe({
  name: 'asRecord',
  pure: true,
})
export class RecordCastPipe implements PipeTransform {
  constructor() {}

  transform(value: ItemVO, args?: any): RecordVO {
    return value as RecordVO;
  }
}

@Pipe({
  name: 'asArchive',
  pure: true,
})
export class ArchiveCastPipe implements PipeTransform {
  constructor() {}

  transform(value: any, args?: any): ArchiveVO {
    return value as ArchiveVO;
  }
}

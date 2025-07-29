import { Pipe, PipeTransform } from '@angular/core';
import { ArchiveVO, FolderVO, ItemVO, RecordVO } from '@models';

@Pipe({
  name: 'asFolder',
  pure: true,
  standalone: false,
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
  standalone: false,
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
  standalone: false,
})
export class ArchiveCastPipe implements PipeTransform {
  constructor() {}

  transform(value: any, args?: any): ArchiveVO {
    return value as ArchiveVO;
  }
}

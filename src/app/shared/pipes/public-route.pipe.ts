import { Pipe, PipeTransform } from '@angular/core';
import { FolderVO, RecordVO } from '@models';

@Pipe({
  name: 'publicRoute'
})
export class PublicRoutePipe implements PipeTransform {

  constructor(
  ) { }

  transform(value: RecordVO | FolderVO, args?: any): any[] {
    const rootArchive = value.archiveNbr.split('-')[0] + '-0000';
    if (value instanceof RecordVO) {
      return ['/p', 'archive', rootArchive, 'record', value.archiveNbr];
    } else {
      return ['/p', 'archive', rootArchive, value.archiveNbr, value.folder_linkId];
    }
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { FolderVO, RecordVO } from '@models';

@Pipe({
  name: 'publicRoute',
})
export class PublicRoutePipe implements PipeTransform {
  constructor() {}

  transform(value: RecordVO | FolderVO, args?: any): any[] {
    const rootArchive = value.archiveNbr.split('-')[0] + '-0000';
    if (value instanceof RecordVO) {
      const route = ['/p', 'archive', rootArchive];
      const parentFolders = value.ParentFolderVOs as FolderVO[];
      if (parentFolders && parentFolders.length > 0) {
        const parentFolder = parentFolders[0];
        route.push(
          parentFolder.archiveNbr,
          parentFolder.folder_linkId.toString(),
        );
      }
      route.push('record', value.archiveNbr);
      return route;
    } else {
      return [
        '/p',
        'archive',
        rootArchive,
        value.archiveNbr,
        value.folder_linkId,
      ];
    }
  }
}
